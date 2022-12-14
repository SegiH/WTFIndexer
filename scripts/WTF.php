<?php

     # Back end used. Must be set to MySQL or SQLServer
     const BACKEND = "SQLServer";

     # Database host name
     const DATABASE_HOST= "SQLServer";

     # Database name
     const DATABASE_NAME= "WTF";

     # Database table
     const DATABASE_TABLE = "WTFEpisodes";

     # Database username
     const DATABASE_USERNAME= "WTFUser";

     # Database Password
     const DATABASE_PASSWORD= "&TwXPDa+;1%39M+";

     # Enable for extra debugging output 
     const DEBUG = false;
     const WTFPATH = "/WTF/"; # If you want to use check in/out set this to the location where files will be stored when checked out
     const WTFARCHIVEPATH = "/WTF/Other/";  # If you want to use check in/out set this to the location where files will be stored when not checked back in

     if (DEBUG == true) {
          ini_set('display_errors',1);
	  ini_set('display_startup_errors',1);
	  error_reporting(E_ALL);
     }

     function CheckInOut() {
          $isCheckedOut = ($_GET["IsCheckedOut"] == "true" ? true : false);
	  
	  $cmd="mv \"" . ($isCheckedOut == true ? WTFPATH : WTFARCHIVEPATH) . "\"" . $_GET["EpisodeNumber"] . "*.* " . ($isCheckedOut == true ? WTFARCHIVEPATH : WTFPATH);

	  set_time_limit(0);

	  $handle = popen($cmd,"r");
         
	  if (ob_get_level() == 0)
	       ob_start();

	  while (!feof($handle)) {
	       $buffer=fgets($handle);

	       ob_flush();

	       flush();
	  }

	  pclose($handle);

	  ob_end_flush();

	  $fileCount = glob(($isCheckedOut == true ? WTFARCHIVEPATH : WTFPATH) . $_GET["EpisodeNumber"] . '*.mp3'); 
	  
	  $success = false;

	  if (sizeof($fileCount) == 0)
		  $success = true;

	  echo json_encode($success);
     }

     function FetchData() {
          $conn = GetConnection();
	  
          $wtfArray = array();

          $sql="SELECT *,dbo.ParseNames(Name) AS IMDBLink FROM " . DATABASE_TABLE . " " . (isset($_GET["FavoritesOnly"]) && $_GET["FavoritesOnly"] == 1 ? "WHERE Favorite=1 " : "") . " ORDER BY EpisodeNumber DESC";

	  if (BACKEND == "MySql") { 
	       $result = $conn->query($sql);
	 
  	       while ($row=mysqli_fetch_assoc($result)) {
	            $filePath=WTFPATH . $row["EpisodeID"] . ' *.mp3';

     	            $fileCount = glob($filePath); 

	            $row["IsCheckedOut"] = (sizeof($fileCount) == 0 ? false : true);

                    $wtfArray[] = $row;
	       }
	  } elseif (BACKEND == "SQLServer") {
               $stmt = $conn->prepare($sql);
               
	       try { 
	           $stmt->execute();
	       } catch(Exception $e) {
		       die("Something went wrong fetching the data with the error" . $e);
	       }

               while ($row = $stmt->fetch()) {
	            $filePath=WTFPATH . $row["EpisodeID"] . ' *.mp3';

     	            $fileCount = glob($filePath); 

	            $row["IsCheckedOut"] = (sizeof($fileCount) == 0 ? false : true);
		    
		    $wtfArray[] = $row;
	       }
	  }

          array_push($results,$arr);
      
          echo json_encode($wtfArray);
          
	  $conn->close();
     }

     function FetchIMDBNames() {
          $conn = GetConnection();

          $imdbArray = array();

          $sql="SELECT * FROM IMDB ORDER BY Name";

	  if (BACKEND == "MySql") { 
               $result = $conn->query($sql);
	 
               while ($row=mysqli_fetch_assoc($result)) {
                    $imdbArray[] = $row;
	       }
	  } elseif (BACKEND == "SQLServer") {
               $stmt = $conn->prepare($sql);
	       
	       try { 
	           $stmt->execute();
	       } catch(Exception $e) {
		       die("Something went wrong fetching the IMDB links" . $e);
	       }
	       
	       while ($row = $stmt->fetch()) {
                    $imdbArray[] = $row;
	       }
	  }

          echo json_encode($imdbArray);
          
          $conn->close();
     }
  
     function GetConnection() {
	  if (BACKEND == "MySql") { 
               $conn = new mysqli(DATABASE_HOST,DATABASE_USERNAME,DATABASE_PASSWORD,DATABASE_NAME);
	  
               if ($conn->connect_error)
                    die("Connection failed: " . $conn->connect_error);
	  } elseif (BACKEND == "SQLServer") { 
	       try {
	            $conn = new PDO("sqlsrv:server=" . DATABASE_HOST . "; Database=" . DATABASE_NAME, DATABASE_USERNAME,DATABASE_PASSWORD);
                    $conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
               } catch(Exception $e) {
                    die( print_r( $e->getMessage() ) );
               }
	  }

	  // Check if the table exists already 
          $sql="SELECT COUNT(*) AS TableCount FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='" . DATABASE_TABLE . "'";

	  $tableExists = false;

	  if (BACKEND == "MySql") { 
               $result = $conn->query($sql);
              
               while ($row=mysqli_fetch_assoc($result)) {
                    $tableExists=($row["TableCount"] == 0 ? false : true);
               }
	  } elseif (BACKEND == "SQLServer") {
               $stmt = $conn->prepare($sql);
	       
	       try { 
	           $stmt->execute();
	       } catch(Exception $e) {
		       die("Something went wrong verifying if the table " . DATABASE_TABLE . " exists with the error " . $e);
	       }
	       
	       while ($row = $stmt->fetch()) {
                    $tableExists=($row["TableCount"] == 0 ? false : true);
	       }
	  }

	  if ($tableExists == false) {
               die("The table " . DATABASE_TABLE . " does not exist. Please create the table schema using the provided SQL");
	  }

          return $conn;
     }

     function getIMDBURLByName($name) {
	  // global $options;
          $conn = GetConnection();
          
	  // Increase max execution time 
	  ini_set('max_execution_time','300');

          $url="https://www.imdb.com/find?q=" . str_replace(" ","%20",htmlspecialchars($name));
          $url="https://www.imdb.com/find?q=" . str_replace(" ","%20",$name);

          $options = array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $url, CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
	  
	  $curl = curl_init($url);

	  $options->CURLOPT_URL=$url;

          curl_setopt_array($curl,$options); 
   
	  $htmlContent = curl_exec($curl);
	  
	  // var_dump($htmlContent);  
	    
	  if ($htmlContent == "")
		  return "";

          curl_close($curl);
          
          $dom = new DOMDocument();
             
          $dom->loadHTML($htmlContent);
   
          $finder = new DomXPath($dom);
  
          // get TD with the class result_text
          $nodes = $finder ->query("//td[contains(@class,'result_text')]");
           
          // First result 
          $nodes=$nodes[0]; 
 
	  if ($nodes == null)
		  return "";

          // Get first hyperlink 
          $link = $nodes->getElementsByTagName("a")[0]->getAttribute("href");
            
          // The link always starts with /name/ so start at index 6 which is 1 char past the 2nd slash 
          $pos = strpos($link,"/",6);

          // Return full URL
	  return "https://www.imdb.com" . substr($link,0,$pos+1);
     }

     // Loads data provided as JSON. Not really needed anymore since ScrapeData does this automatically
     // Commented out on 11-03-2020 not used any more
     /*function LoadPayload() {
          $tmp_payload=json_decode($_GET["Payload"]);
          $payload=json_decode($tmp_payload);

          $conn = GetConnection();
     
          for ($c=0;$c<count($payload);$c++) {
               // Before inserting the row, verify if it has already been added
               $sql="SELECT * FROM " . DATABASE_TABLE . " WHERE EpisodeNumber=" . $payload[$c]->EpisodeNumber;
            
               $result = $conn->query($sql);
 
               if ($result->num_rows > 0) {
                    continue;
               }

	      $sql="IF (SELECT COUNT(*) FROM " . DATABASE_TABLE . " WHERE EpisodeNumber=" . $payload[$c]->EpisodeNumber . ") = 0 INSERT INTO " . DATABASE_TABLE . "(EpisodeNumber,Name,ReleaseDate) VALUES(" . $payload[$c]->EpisodeNumber . ",'" . str_replace('\"',"",str_replace("'","\'",$payload[$c]->Name)) . "','" . $payload[$c]->ReleaseDate . "');";
    
	      // echo $sql . "<BR><BR>";
	  
              try {
	           if (!mysqli_query($conn,$sql)) {
	                echo "An error occurred adding episode number " . $payload[$c]->EpisodeNumber . " with the sql " . $sql . " and the error " . mysqli_error($conn);		  
	           }
	      } catch(Exception $e) {
                  echo "A fatal error occurred inserting the row with the sql " . $sql . " and the error " . mysqli_error($conn);
              }
          }

          $conn->close();
     }*/

     function ScrapeData() {
	  $conn = GetConnection();

          $url="https://en.wikipedia.org/wiki/List_of_WTF_with_Marc_Maron_episodes" . "?ts=" . time();
          
          $curl = curl_init($url);

          $options = array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $url, CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
         
          curl_setopt_array($curl,$options); 

          $htmlContent = curl_exec($curl);

	  curl_close($curl);
         
	  $dom = new DOMDocument();
         
	  $dom->loadHTML($htmlContent);

          $finder = new DomXPath($dom);

	  $nodes = $finder ->query("//table[contains(@class,'wikiepisodetable')]");

	  $tablesToProcess;

	  // If this param to get all rows isn't set, get the 2nd to last table which will be the current year and process this table only. The last table is currently an Other Episodes table that I don't care about
          if (!isset($_GET["AllRows"])) {
               $c=0;
	       foreach($nodes as $table) {
                    // echo "node size is " . $nodes->length . "<BR><BR>";
                    if ($c==$nodes->length-2) { 
                         $tablesToProcess = $table->childNodes;
                         //$tablesToProcess = $table;
			 break;
	            }

                    $c++;
	      }
	  } else {
		  $tablesToProcess=$nodes;
	  }
	   
          // Loop through all tables to process
          foreach ($tablesToProcess as $currTable) {
               $rows=$currTable->getElementsByTagName("tr");
	       
	       foreach($rows as $currRow) {
                    $items=explode('"',$currRow->textContent);
		    
		    //echo "inside of inner foreach loop " . $currRow->textContent . " when the size is " . sizeof($items) . "<BR><BR>";
                    
                    if (sizeof($items) == 3) {
                         $epNumber = $items[0];
                         $name = $items[1];
                         $releaseDate = $items[2];
                         $releaseDate = str_replace("??"," ",$releaseDate); // When scraping the data, this character shows up in the release date. This removes it 
                         $releaseDate = str_replace("?"," ",$releaseDate); // When scraping the data, this character shows up in the release date. This removes it 
			 
			 //echo "Release date 1: = " . $releaseDate . "<BR><BR>";  
			 
			 if (DEBUG == true) {
			      echo "Processing " . $epNumber . " with the name " . $name . "<BR><BR>";
			 }

		         if (strpos($releaseDate,"(") !== false) {
                              $releaseDate=substr($releaseDate,0,strpos($releaseDate,"(")-2);
		         }

                         // Before inserting the row, verify if it has already been added
                         $sql="SELECT COUNT(*) AS EpCount FROM " . DATABASE_TABLE . " WHERE EpisodeNumber=" . $epNumber;
          
			 if (DEBUG == true) {
			      echo "Before inserting the row, verify if it has already been added, sql=" . $sql . "<BR><BR>";
			 }

 		         $hasRows=false;

        	         if (BACKEND == "MySql") {
                              $result = $conn->query($sql);

			      //$num_rows=$result->num_rows;
			      
                              while ($row=mysqli_fetch_assoc($result)) {
			           if ($rows["EpCount"] > 0)
                                        $hasRows=true;
	                      }
			 } elseif (BACKEND == "SQLServer") {
                                   $stmt = $conn->prepare($sql);

			           $stmt->execute();
				   
                                   while ($row = $stmt->fetch()) {
	                                if ($row["EpCount"] > 0)
                                             $hasRows=true;
	                           }
			 } 
			 
			 if ($hasRows == false) {
                              //$sql="UPDATE " . DATABASE_TABLE . " SET ReleaseDate2='" . $releaseDate . "' WHERE EpisodeNumber=" . $epNumber . ";";
                              $sql="INSERT INTO " . DATABASE_TABLE . "(EpisodeNumber,Name,ReleaseDate) VALUES(" . $epNumber . ",'" . str_replace('\"',"",str_replace("'","\'",$name)) . "',REPLACE(REPLACE('" . $releaseDate . "',CHAR(63), ' '),CHAR(194),' '));";
                              
			      $sql=str_replace(chr(160),"",$sql);

			      if (DEBUG == true) {
			           echo "EPISODE INSERT sql=" . $sql . "<BR><BR>";
			      }

        	              if (BACKEND == "MySql") {		      
                                   try {
	                                if (!mysqli_query($conn,$sql)) {
	                                     echo "An error occurred adding episode number " . $epNumber . " with the sql " . $sql . " and the error " . mysqli_error($conn);		  
                                        }
                                   } catch(Exception $e) {
                                        echo "A fatal error occurred inserting the row with the sql " . $sql . " and the error " . mysqli_error($conn);
				   }
			      } elseif (BACKEND == "SQLServer") {
                                   $stmt = $conn->prepare($sql);

			           $stmt->execute();
			      }
			 }

			 if (is_integer($epNumber) && strpos($name,"&") == false && strpos($name,"/") == false) { 
                              // Get the IMDB URL based on the name
                              $imdbURL=getIMDBURLByName($name);

                              // Before inserting into the IMDB table, make sure that the name isn't in the table already
                              $sql="SELECT * FROM IMDB WHERE Name='" . $name . "'";
          
                              $result = $conn->query($sql);
 
                              if ($result->num_rows > 0) {
                                   continue;
			      }

			      $sql="INSERT INTO IMDB (Name,IMDBURL) VALUES('" . str_replace("'","''",$name) . "','" . $imdbURL . "');";

			      if (DEBUG == true) {
			           echo "IMDB INSERT, sql=" . $sql . "<BR><BR>";
			      }
			
                              try {
                                   if (!mysqli_query($conn,$sql)) {
                                        echo "An error occurred adding the name " . $name . " into the IMDB table with the sql " . $sql . " and the error " . mysqli_error($conn);		  
                                   }
                              } catch(Exception $e) {
                                   echo "A fatal error occurred inserting the row with the sql " . $sql . " and the error " . mysqli_error($conn);
			      }
                         }
		    }
	       }
	  }

	  ScrapeMetaData();

	  echo json_encode(array("OK"));
     }

     function ScrapeMetaData() {
	  // Use this when providing payload data passed as metadata
	  //$payload=json_decode($_GET["Metadata"],true);
          //$payload=json_decode($payload);
	  
	  $payload = array();

	  $conn = GetConnection();

	  set_time_limit(6000);

	  // Scrape data from WTF site
	  $url="https://www.wtfpod.com/podcast";

	  $curl = curl_init($url);
	       
          $options = array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $url, CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
	  
	  $curl = curl_init($url);

	  $options->CURLOPT_URL=$url;

          curl_setopt_array($curl,$options); 
   
	  $htmlContent = curl_exec($curl);
	  
	  // var_dump($htmlContent);  
	    
	  curl_setopt_array($curl,$options); 

	  $htmlContent = curl_exec($curl);
	  
	  curl_close($curl);

	  $dom = new DOMDocument();
         
	  $dom->loadHTML($htmlContent);

	  $finder = new DomXPath($dom);

	  $nodes = $finder->query("//article[contains(@class,'entry')]");
	  
          foreach ($nodes as $key => $currItem) {
	       $epNum=$nodes[$key]->getElementsByTagName("header")[0]->getElementsByTagName("h1")[0]->getElementsByTagName("a")[0]->textContent; // ->src; //getAttribute("target");

	       $epNum=explode(" ",$epNum)[1];
	       
	       $article=$nodes[$key]->getElementsByTagName("header")[0]->getElementsByTagName("h1")[0]->getElementsByTagName("a")[0]->getAttribute('href');

	       array_push($payload,array($epNum,$article));
	  }

	  foreach ($payload as $key => $currEpisode) {
	       //echo  $currEpisode[0] . " " . $currEpisode[1] . "<BR><BR>";

	       $epNum=$currEpisode[0];
 
	       if (!is_int($epNum))
		    continue;

	       $url=$currEpisode[1];
	       
	       $curl = curl_init($url);
	       
	       curl_setopt_array($curl,$options); 

	       $htmlContent = curl_exec($curl);

	       curl_close($curl);

	       $dom = new DOMDocument();
         
	       $dom->loadHTML($htmlContent);

	       $finder = new DomXPath($dom);

	       $nodes = $finder->query("//article[contains(@class,'entry')]");
 
	       $article=$nodes[0]->getElementsByTagName("p")[0]->textContent;

	       $article=str_replace("'","''",$article);

	       $sql="Update WTFEpisodes Set Description='" . htmlspecialchars($article) . "' WHERE EpisodeID=" . $epNum;

	       if (BACKEND == "MySql") {		      
	       	    try {
	                 if (!mysqli_query($conn,$sql)) {
	                      echo "An error occurred adding episode number " . $epNumber . " with the sql " . $sql . " and the error " . mysqli_error($conn);		  
                         }
                    } catch(Exception $e) {
                         echo "A fatal error occurred inserting the row with the sql " . $sql . " and the error " . mysqli_error($conn);
	            }
	       } elseif (BACKEND == "SQLServer") {
                    $stmt = $conn->prepare($sql);
                    
		    // echo $sql . "<BR><BR>";
	            $stmt->execute();
               }
	  }
     }

     function UpdateEpisodes() {
          $conn = GetConnection();

          $episodeUpdatePayload=json_decode($_GET["EpisodePayload"]);
          
          foreach ($episodeUpdatePayload as $currEpisodeUpdate) {
                $sql="UPDATE " . DATABASE_TABLE . " SET Name='" . str_replace("'","''",$currEpisodeUpdate->Name) . "' WHERE EpisodeNumber=" . $currEpisodeUpdate->EpisodeNumber;

	        if (BACKEND == "MySQL") {	
                     try {
                          if (!mysqli_query($conn,$sql)) {
                               echo "An error occurred updating the episode data in UpdateEpisodes() URL with the sql " . $sql . " and the error " . mysqli_error($conn);
                          }
                     } catch(Exception $e) {
                          echo "An error occurred updating the episode data in UpdateEpisodes() URL with the sql " . $sql . " and the error " . mysqli_error($conn);
		     }
		} elseif (BACKEND == "SQLServer") {
		    $stmt = $conn->prepare($sql);
 
                    $stmt->execute(); 
		}
 	 
          }
          
          echo json_encode("OK");
     }

     function UpdateFavorite() { 
          $conn = GetConnection();

          $sql="UPDATE " . DATABASE_TABLE . " SET Favorite=" . ($_GET["FavoriteValue"] == "1" ? "1" : "0") . " WHERE EpisodeNumber=" . $_GET["EpisodeNumber"] . ";";
	  
	  if (BACKEND == "MySQL") {	
               try {
                    if (!mysqli_query($conn,$sql)) {
                         echo "An error occurred adding episode number " . $payload[$c]->EpisodeNumber . " with the sql " . $sql . " and the error " . mysqli_error($conn);		  
                    }
               } catch(Exception $e) {
                    echo "A fatal error occurred updating the favorite with the sql " . $sql . " and the error " . mysqli_error($conn);
               }
	  } elseif (BACKEND == "SQLServer") {
	       $stmt = $conn->prepare($sql);
 
               $stmt->execute(); 
	  }
	 
          echo json_encode("OK");
     }

     function UpdateIMDB() {
          $conn = GetConnection();

          $imdbUpdatePayload=json_decode($_GET["IMDBPayload"]);
     
          foreach ($imdbUpdatePayload as $currIMDBUpdate) {
               $sql="UPDATE IMDB SET Name='" . str_replace("'","''",$currIMDBUpdate->Name) . "' WHERE ID=" . $currIMDBUpdate->ID;

	       if (BACKEND == "MySQL") {	
                    try {
                         if (!mysqli_query($conn,$sql)) {
                              echo "An error occurred updating the IMDB data with the sql " . $sql . " and the error " . mysqli_error($conn);
                         }
                     } catch(Exception $e) {
                         echo "An error occurred updating the IMDB with the sql " . $sql . " and the error " . mysqli_error($conn);
	             }       
	       } elseif (BACKEND == "SQLServer") {
	            $stmt = $conn->prepare($sql);
 
                    $stmt->execute(); 
	       }
	  }
          
          echo json_encode("OK");
     }

     function UpdateIMDBURL() {
          $conn = GetConnection();
          
          $rowExists=false;
	  
          $sql="SELECT COUNT(*) AS LinkRowCount FROM IMDB WHERE IMDBURL='" . htmlspecialchars($_GET["Link"]) . "';";
	  
	  if (BACKEND == "MySQL") {	
               $result = $conn->query($sql);
	  
               while ($row=mysqli_fetch_assoc($result)) {
                    $rowExists=($row["LinkRowCount"] == 0 ? false : true);
               }
	  } elseif (BACKEND == "SQLServer") {
	       $stmt = $conn->prepare($sql);
 
	       try { 
	           $stmt->execute();
	       } catch(Exception $e) {
		       die("Something went wrong checking the IMDB URL with the sql " . $sql . " and the error" . $e);
	       }

               while ($row = $stmt->fetch()) {
                    $rowExists=($row["LinkRowCount"] == 0 ? false : true);
	       }
	  }

          //if ($rowExists == true) {
          //     echo json_encode($_GET["Name"] . " is already in the database");
          //     return;
          //}
       
          if ($rowExists == true) {
               $sql="UPDATE IMDB SET IMDBURL='" . htmlspecialchars($_GET["Link"]) . "' WHERE Name='" . htmlspecialchars($_GET["Name"]) . "';";
          } else {
               $sql="INSERT INTO IMDB (Name,IMDBURL) VALUES('" . htmlspecialchars($_GET["Name"]) . "','" . htmlspecialchars($_GET["Link"]) . "');";
	  }

	  if (BACKEND == "MySQL") {	
               try {
                    if (!mysqli_query($conn,$sql)) {
                         echo "An error occurred " . ($rowExists == true ? "updating the IMDB URL for " : "adding ") . htmlspecialchars($_GET["Name"]) . " with the sql " . $sql . " and the error " . mysqli_error($conn);
                    }
               } catch(Exception $e) {
                    echo "A Fatal error occurred " . ($rowExists == true ? "updating the IMDB URL for " : "adding ") . htmlspecialchars($_GET["Name"]) . " with the sql " . $sql . " and the error " . mysqli_error($conn);
               }         
	  } else if (BACKEND == "SQLServer") {
	       $stmt = $conn->prepare($sql);
 
               $stmt->execute(); 
	  }

	  echo json_encode("OK");
     }

     if (isset($_GET["ScrapeMetaData"])) {
          ScrapeMetaData();
     }

     if (isset($_GET["CheckInOut"]) && isset($_GET["EpisodeNumber"]) && isset($_GET["IsCheckedOut"])) {
          CheckInOut(); 
     }

     if (isset($_GET["FetchData"])) {
          FetchData();
     }

     if (isset($_GET["FetchIMDBNames"])) {
          FetchIMDBNames();
     }

     if (isset($_GET["LoadPayload"])) {
          LoadPayload();
     }

     if (isset($_GET["ScrapeData"])) {
          ScrapeData();
     }

     if (isset($_GET["UpdateIMDBURL"]) && isset($_GET["Name"]) && isset($_GET["Link"])) {
          UpdateIMDBURL(); 
     }

     if (isset($_GET["UpdateFavorite"]) && isset($_GET["EpisodeNumber"]) && isset($_GET["FavoriteValue"])) {
          UpdateFavorite(); 
     }

     if (isset($_GET["UpdateEpisodes"])) {
           UpdateEpisodes();
     }
     
     if (isset($_GET["UpdateIMDB"])) {
           UpdateIMDB();
     }
?>
