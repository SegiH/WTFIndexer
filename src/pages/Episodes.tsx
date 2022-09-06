import React, { useCallback, useEffect, useMemo, useState} from "react";
import { IonButton,IonCheckbox, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonInput, IonLabel, IonPage, IonRow, IonSelect, IonSelectOption, IonToolbar } from '@ionic/react';
import axios from 'axios';
import { closeOutline, createOutline, heart, heartOutline, saveOutline } from 'ionicons/icons';

const Episodes = (props: any) => {
     const [columnSizes,setColumnSizes] = useState({});
     const [descriptionVisible,setDescriptionVisible] = useState(false);
     const [episodeFilter,setEpisodeFilter] = useState('');
     const [episodePayload,setEpisodePayload] = useState([]);
     const [favoritesVisible,setFavoritesVisible] = useState(false);
     const [editingID,setEditingID] = useState(0);
     const [previousEpisodePayload,setPreviousEpisodePayload] = useState([]);
     const [recordCount,setRecordCount] = useState(50);
     
     const recordCountSizes = useMemo(() => [25, 50, 100, 500, 1000, 5000], []);

     const cancelClickHandler = () => {
          let episode : any = episodePayload.filter((episode : any)=> episode["EpisodeID"] === editingID);

          if (episode.length === 0) { // This shouldn't ever happen
               alert(`Unable to find the episode with the ID ${editingID}`);
               return;
          }

          Object.assign(episode[0],previousEpisodePayload);

          props.setIsEditing(false);
     }

     const checkInOutClickHandler = async (episodeID: number, event: any) => {
          const episode : any = episodePayload.filter((episode : any) => episode["EpisodeID"] === episodeID);
          
          if (episode.length === 0) { // This shouldn't ever happen
               alert(`Unable to find the episode with the ID ${episodeID}`);
               return;
          }

          const newCheckInOutValue=(episode[0].IsCheckedOut === true ? false : true);

          await axios.get(`${props.backendURL}/CheckInOut?EpisodeNum=${episode[0].EpisodeNum}&IsCheckedOut=${newCheckInOutValue === true ? 0 : 1}`, { headers: { "Authorization": `Bearer ${props.authorization}` }})
          .then(()=> {
               const newEpisodePayload : any = Object.assign([],episodePayload)
               const currentEpisode = newEpisodePayload.filter((episode:any) => episode["EpisodeID"] === episodeID);
               currentEpisode[0].IsCheckedOut = newCheckInOutValue;

               setEpisodePayload(
                    newEpisodePayload,
               )
          })
          .catch((err : any) => {
               alert(`An error occurred ${!newCheckInOutValue ? "checking out" : "checking in"} the favorites with the error ${err.message}`);
          })

     }

     const descriptionVisibleClickHandler = () => {
          setDescriptionVisible(!descriptionVisible);          
     }

     const determineColumnSizes = useCallback(() => {
          // Objects that controls column sizes depending on which columns are visible - I do this to utilize all of the space that I can dynamically
          const minimumColumnSizes = {'Ep #' : 1, 'Name' : 8,'Release Date' : 2,'Fvt' : 1}; // Editing not allowed, checkout not allowed, description hidden
          const editingOnlyColumnSizes =  {'Action': 2,'Ep #': 1,'Name': 6,'Release Date': 2,'Fvt': 1}; // Editing allowed, checkout not allowed, description hidden
          const checkoutAllowedOnlyColumnSizes = {'Ep #': 1,'Name': 6,'Release Date': 2,'Fvt': 1,'Check In/Out': 2}; // Editing not allowed, checkout allowed, description hidden
          const descriptionVisibleOnlyColumnSizes = {'Ep #': 1,'Name': 4,'Description': 4,'Release Date': 2,'Fvt': 1}; // Editing not allowed, checkout not allowed, description visible
          const editingCheckoutAllowedColumnSizes = {'Action' : 2,'Ep #': 1,'Name': 4,'Release Date': 2,'Fvt': 1,'Check In/Out': 2}; // Editing allowed, checkout allowed, description hidden     
          const editingDescriptionVisibleColumnSizes = {'Action': 2,'Ep #': 1,'Name': 3,'Description': 3,'Release Date': 2,'Fvt': 1}; // Editing allowed, checkout allowed, description hidden     
          const checkoutDescriptionVisibleColumnSizes = {'Ep #': 1,'Name': 3,'Description': 3,'Release Date': 2,'Fvt': 1,'Check In/Out': 2}; // Editing not allowed, checkout allowed, description hidden
          const maximumColumnSizes = {'Action': 2,'Ep #': 1,'Name': 2,'Description': 2,'Release Date': 2,'Fvt': 1,'Check In/Out': 2}; // Editing allowed, checkout allowed, description visible    

          if (!props.checkoutAllowed && !descriptionVisible && !props.editingAllowed) {
               setColumnSizes(minimumColumnSizes);
          } else if (props.editingAllowed && !props.checkoutAllowed && !descriptionVisible) {
               setColumnSizes(editingOnlyColumnSizes);
          } else if (!props.editingAllowed && props.checkoutAllowed && !descriptionVisible) {
               setColumnSizes(checkoutAllowedOnlyColumnSizes);
          } else if (!props.editingAllowed && !props.checkoutAllowed && descriptionVisible) {
               setColumnSizes(descriptionVisibleOnlyColumnSizes);
          } else if (props.editingAllowed && props.checkoutAllowed && !descriptionVisible) {
               setColumnSizes(editingCheckoutAllowedColumnSizes);
          } else if (props.editingAllowed && !props.checkoutAllowed && descriptionVisible) {
               setColumnSizes(editingDescriptionVisibleColumnSizes);
          } else if (!props.editingAllowed && props.checkoutAllowed && descriptionVisible) {
               setColumnSizes(checkoutDescriptionVisibleColumnSizes);
          } else if (props.editingAllowed && props.checkoutAllowed && descriptionVisible) {
               setColumnSizes(maximumColumnSizes);
          } else {
               alert("Invalid column size!!!")
          }
     },[props.checkoutAllowed, descriptionVisible, props.editingAllowed])

     const editClickHandler = (episodeID: number) => {
          // Save the current episode in case the user cancels
          const episode : any = episodePayload.filter((episode : any) => episode["EpisodeID"] === episodeID);

          if (episode.length === 0) { // This shouldn't ever happen
               alert(`Unable to find the episode with the ID ${episodeID}`);
               return;
          }

          setPreviousEpisodePayload(Object.assign({},episode[0]));

          setEditingID(episodeID);
          props.setIsEditing(true);
     }

     const episodeFilterChangeHandler = (event: any) => {
          setEpisodeFilter(event.target.value);
     }

     const favoritesVisibleClickHandler = () => {
          setFavoritesVisible(!favoritesVisible);
     }

     const favoriteUpdatedClickHandler = async (episodeID: number, event: any) => {
          const episode : any = episodePayload.filter((episode : any) => episode["EpisodeID"] === episodeID);

          if (episode.length === 0) { // This shouldn't ever happen
               alert(`Unable to find the episode with the ID ${episodeID}`);
               return;
          }

          const newFavoriteValue=(episode[0].Favorite === true ? false : true);

          await axios.put(`${props.backendURL}/UpdateFavorite?EpisodeNum=${episode[0].EpisodeNum}&FavoriteValue=${newFavoriteValue}`,null,{ headers: { "Authorization": `Bearer ${props.authorization}` }})
          .then(()=> {
               const newEpisodePayload : any = Object.assign([],episodePayload)
               const currentEpisode = newEpisodePayload.filter((episode:any) => episode["EpisodeID"] === episodeID);
               currentEpisode[0].Favorite = newFavoriteValue;

               setEpisodePayload(
                    newEpisodePayload,
               )
          })
          .catch((err: any)=> {
               alert(`An error occurred updating the favorites with the error ${err.message}`);
          })
     }

     const getColumnSize = (columnName: string) => {
          const size=Object.entries(columnSizes).filter((column) => column[0] === columnName);

          if (size.length > 0) // This shouldn't ever be false
               return String(size[0][1]);
          else
               return "2"
     }

     const getEpisodes = useCallback(async (recordCountOverride : number = 50) => {
          props.setEpisodesLoadingStarted(true);
          props.setIsLoading(true);

          let params=`?RecordCount=${(typeof recordCountOverride !== 'undefined' ? recordCountOverride : recordCount)}` + (favoritesVisible === true ? '&FavoritesOnly=1' : '');

          await axios.get(`${props.backendURL}/GetEpisodes${params}`,{ headers: { "Authorization": `Bearer ${props.authorization}` }})
          .then(async (res: any)=> {
               res.data?.forEach((episode: any) => {
                    if (episode.IMDBLink !== null && episode.IMDBLink.indexOf(" target=") === -1) {
                         episode.IMDBLink=episode.IMDBLink.replace('">','" target="_blank">')
                    }
               });

               props.setEpisodesLoaded(true);

               await axios.get(`${props.backendURL}/GetEpisodeCheckInOutStatus`,{ headers: { "Authorization": `Bearer ${props.authorization}` }})
               .then((episodeCheckInOutStatus: any) => {
                    episodeCheckInOutStatus?.data.forEach((episodeItemCheckInOut: any) => {
                         const thisEpisode : any = res.data.filter((episode : any) => episode["EpisodeNum"] === episodeItemCheckInOut.EpisodeNum);

                         if (thisEpisode.length === 1) {
                              thisEpisode[0].IsCheckedOut=(episodeItemCheckInOut.IsCheckedIn === 1 ? true : false);

                              if (episodeItemCheckInOut.IsCheckedIn === -1) {
                                   thisEpisode[0].FileNotFound = true;
                              }
                         }
                    });

                    props.setIsLoading(false);
                    setEpisodePayload(res.data);
                    props.setEpisodeCheckInOutStatusLoaded(true);
               })
               .catch((err: any)=> {
                    alert(`An error occurred fetching the episode check in/out status with the error ${err}`);
               })
          })
          .catch((err :any)=> {
               alert(`An error occurred fetching the episodes with the error ${err.message}`);
          })
     },[favoritesVisible, props, recordCount]);

     const recordcountChangeHandler = (event: any) => {
          setRecordCount(event.target.value);

          getEpisodes(event.target.value);
     }

     const rowUpdatedChangeHandler = (episodeID: number,fieldName: string, event: any) => {
          const episode : any = episodePayload.filter((episode : any) => episode["EpisodeID"] === episodeID);

          if (episode.length === 0) { // This should never happen!
               alert("Unable to locate the object episode!");
               return;
          }

          episode[0][fieldName] = event.target.value;
     }

     const saveClickHandler = async () => {
          let episode : any = episodePayload.filter((episode : any) => episode["EpisodeID"] === editingID);

          if (episode.length === 0) { // This shouldn't ever happen
               alert(`Unable to find the episode with the ID ${editingID}`);
               return;
          }

          if (episode[0].Name === "") {
               alert("You must enter the name");
               return;
          }

          if (episode[0].Description === "") {
               alert("You must enter the description");
               return;
          }

          if (episode[0].ReleaseDate === "") {
               alert("You must enter the release date");
               return;
          }

          await axios.put(`${props.backendURL}/UpdateEpisodes?EpisodeID=${episode[0].EpisodeID}&Name=${episode[0].Name}&Description=${episode[0].Description}&ReleaseDate=${episode[0].ReleaseDate}`,null,{ headers: { "Authorization": `Bearer ${props.authorization}` }})
          .then(()=> {               
          })
          .catch((err: any) => {
               alert(`An error occurred updating the episodes with the error ${err.message}`);
          })

          props.setIsEditing(false);
     }

     async function searchNext($event: CustomEvent<void>) {
          ($event.target as HTMLIonInfiniteScrollElement).complete();
     }

     const updateClickHandler = async () => {
          if (props.authorization === '' || props.backendURL === '')
               return;

          const episodeIDs : any = episodePayload.map((episode : any) => episode["EpisodeID"]);

          const nextEpisodeNumber = Math.max(...episodeIDs) + 1;

          await axios.put(`${props.backendURL}/ScrapeData?StartingEpisodeNum=${nextEpisodeNumber}`,null,{ headers: { "Authorization": `Bearer ${props.authorization}` }})
          .then(async (res: any)=> {
               getEpisodes();
          })
          .catch((err :any)=> {
               alert(`An error occurred updating the episodes with the error ${err.message}`);
          });
     }

     useEffect(() => {
          if (props.authorization !== '' && props.backendURL !== '') {
               // !props.episodesLoadingStarted is included to make sure that this is only initialized once
               if (typeof props.initialRecordCount !== 'undefined' && recordCountSizes.includes(parseInt(props.initialRecordCount)) && !props.episodesLoadingStarted) {
                    setRecordCount(parseInt(props.initialRecordCount));
                    getEpisodes(parseInt(props.initialRecordCount));
               } else if (!props.episodesLoaded && !props.episodesLoadingStarted) {
                    getEpisodes();
               }

               determineColumnSizes();
          }

          //setRecordCount(props.initialRecordCount);
     },[determineColumnSizes, getEpisodes, props.authorization, props.backendURL, props.episodesLoaded, props.episodesLoadingStarted, props.initialRecordCount, recordCountSizes]);

     useEffect(() => {
          determineColumnSizes();
     },[descriptionVisible, determineColumnSizes]);

     return (
          <IonPage>
               <IonHeader>
                    <IonToolbar>
                    </IonToolbar>
               </IonHeader>

               <IonContent scrollX={true}>
                    {!props.isLoading && props.episodeCheckInOutStatusLoaded && Object.keys(columnSizes).length > 0 &&
                         <IonGrid className="backgroundEEE sticky">                         
                              <>
                                   <IonRow>
                                        {!props.isEditing &&
                                             <>
                                                  <IonCol size="3">
                                                       <IonCheckbox checked={favoritesVisible} onIonChange={favoritesVisibleClickHandler} />
                                                       <IonLabel className="blackText leftMargin15">Favorites</IonLabel>
                                                  </IonCol>
                                        
                                                  <IonCol size="3">
                                                       <IonCheckbox checked={descriptionVisible} onIonChange={descriptionVisibleClickHandler}/>
                                                       <IonLabel className="blackText leftMargin15">Description</IonLabel>
                                                  </IonCol>

                                                  <IonCol size="2">
                                                       <IonLabel className="blackText">Record Count</IonLabel>
                                                  </IonCol>
                                        
                                                  <IonCol size="3">
                                                       <IonSelect className="recordCount" value={recordCount} onIonChange={recordcountChangeHandler}>
                                                            {recordCountSizes.map((size: number, index: number) => {
                                                                 return <IonSelectOption key={index} value={size}>{size}</IonSelectOption>
                                                            })}
                                                       </IonSelect>
                                                  </IonCol>
                                                  
                                                  <IonCol size="1"></IonCol>

                                                  <IonCol size="1" className="blackText narrowCell">
                                                       Filter
                                                  </IonCol>

                                                  <IonCol size="4">
                                                       <IonInput type="text" className="blackText removeBoxSizing underline" value={episodeFilter} onIonChange={episodeFilterChangeHandler} />
                                                  </IonCol>                                                  

                                                  {props.episodesLoaded && props.episodeCheckInOutStatusLoaded && !props.isAdding && !props.isLoading &&
                                                  <>
                                                       <IonCol size="5"></IonCol>

                                                       <IonCol size="2">
                                                            <IonButton id="update" size="small" color="primary" onClick={updateClickHandler}>Update</IonButton>
                                                       </IonCol>
                                                  </>
                                             }
                                             </>
                                        }

                                        {props.isEditing &&
                                             <>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                             </>
                                        }

                                        {Object.keys(columnSizes).filter((key,index)=> (!props.isEditing || (props.isEditing && key !== "Favorite" && key !== "Check In/Out"))).map((key,index) => {
                                             return (
                                                  <IonCol key={index} size={getColumnSize(key)} className="blackText tableHeader headerTextFont">{key}</IonCol>
                                             );
                                        })}
                                   </IonRow>
                              </>
                         </IonGrid>
                    }

                    {!props.isLoading && props.episodeCheckInOutStatusLoaded && typeof episodePayload !== 'undefined' &&
                         <IonInfiniteScroll threshold="100px" onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                              <IonInfiniteScrollContent loadingText="Loading episodes">                                   
                                   {episodePayload?.filter((episode : any) => {                                                                                     
                                        if ((episodeFilter === '' && favoritesVisible === false) || (favoritesVisible === true && episode.Favorite === true))
                                                  return episode;
                                        else {
                                             return (
                                                    (episode.EpisodeNum.toString().startsWith(episodeFilter) ||
                                                    (episode.Name.trim() !== "" && episode.Name.toLowerCase().includes(episodeFilter.toLowerCase())) ||
                                                    (descriptionVisible && episode.Description.includes(episodeFilter)) ||
                                                     episode.ReleaseDate.includes(episodeFilter))
                                                     && (favoritesVisible === false || (favoritesVisible === true && episode.Favorite === true))
                                             )
                                        }
                                   })
                                   .map((episode: any, index: number) => {
                                        return (
                                             <React.Fragment key={index}>
                                                  {(!props.isEditing || (props.isEditing && editingID === episode.EpisodeID)) && 
                                                       <IonRow>
                                                            {props.editingAllowed &&                                                        
                                                                 <IonCol size={getColumnSize('Action')} className='tableCell'>
                                                                      {!props.isEditing &&
                                                                           <IonIcon icon={createOutline} className="icon clickable" onClick={() => editClickHandler(episode.EpisodeID)}></IonIcon>
                                                                      }
                                                                 
                                                                      {props.isEditing &&
                                                                           <>
                                                                                <IonIcon icon={saveOutline} className="icon clickable" onClick={saveClickHandler}></IonIcon>
                                                                                <IonIcon icon={closeOutline} className="icon clickable leftMargin15" onClick={cancelClickHandler}></IonIcon>
                                                                           </>
                                                                      }
                                                                 </IonCol>
                                                            }

                                                            <IonCol size={getColumnSize('Ep #')} className="tableCell">
                                                                 {((!props.isEditing && episode.DownloadLink === null) || props.isEditing) &&
                                                                      <div className="textFont">{episode.EpisodeNum}</div>
                                                                 }

                                                                 {!props.isEditing && episode.DownloadLink !== null &&
                                                                      <a href={episode.DownloadLink} target="_blank" rel="noreferrer"><div className="textFont">{episode.EpisodeNum}</div></a>
                                                                 }
                                                            </IonCol>

                                                            <IonCol size={getColumnSize('Name')} className="tableCell wrap">
                                                                 {!props.isEditing && episode.IMDBLink === null &&
                                                                      <IonLabel className="textFont">{episode.Name}</IonLabel>
                                                                 }

                                                                 {!props.isEditing && episode.IMDBLink !== null &&
                                                                      <div className="textFont" dangerouslySetInnerHTML={{__html: episode.IMDBLink}}></div>
                                                                 }

                                                                 {props.isEditing && 
                                                                      <IonInput type="text" placeholder={episode.Name} value={episode.Name} onIonChange={(event: any) => rowUpdatedChangeHandler(episode.EpisodeID,"Name",event)} />
                                                                 }
                                                            </IonCol>

                                                            {descriptionVisible &&
                                                                 <IonCol size={getColumnSize('Description')} className="tableCell">
                                                                      {!props.isEditing &&
                                                                           <div className="textFont">{episode.Description}</div>
                                                                      }

                                                                      {props.isEditing && 
                                                                           <IonInput type="text" placeholder={episode.Description} value={episode.Description} onIonChange={(event: any) => rowUpdatedChangeHandler(episode.EpisodeID,"Description",event)} />
                                                                      }
                                                                 </IonCol>
                                                            }

                                                            <IonCol size={getColumnSize('Release Date')} className="tableCell">
                                                                 {!props.isEditing &&
                                                                      <div className="textFont">{episode.ReleaseDate}</div>
                                                                 }

                                                                 {props.isEditing && 
                                                                      <IonInput type="text" placeholder={episode.ReleaseDate} value={episode.ReleaseDate} onIonChange={(event: any) => rowUpdatedChangeHandler(episode.EpisodeID,"ReleaseDate",event)} />
                                                                 }
                                                            </IonCol>

                                                            {!props.isEditing &&
                                                                 <IonCol size={getColumnSize('Fvt')} className="tableCell">
                                                                      <IonIcon icon={episode.Favorite === true ? heart : heartOutline} className="icon clickable" onClick={(event: any) => favoriteUpdatedClickHandler(episode.EpisodeID,event)}></IonIcon>
                                                                 </IonCol>
                                                            }

                                                            {props.checkoutAllowed && !props.isEditing &&
                                                                 <IonCol size={getColumnSize('Check In/Out')} className="tableCell">
                                                                      <IonButton color="primary" disabled={episode.FileNotFound === true} onClick={(event) => checkInOutClickHandler(episode.EpisodeID,event)}>{!props.episodeCheckInOutStatusLoaded ? "Checking.." : episode.FileNotFound === true ? "Not Found" : episode.IsCheckedOut === true ? "Check In" : "Check Out"}</IonButton>                                                                      
                                                                 </IonCol>
                                                            }
                                                       </IonRow>
                                                  }
                                             </React.Fragment>
                                        );
                                   })}
                              </IonInfiniteScrollContent>
                         </IonInfiniteScroll>
                    }
               </IonContent>
          </IonPage>
     );
};

export default Episodes;