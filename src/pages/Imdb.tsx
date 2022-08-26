import React, { useCallback, useEffect, useState} from "react";
import { IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonInput, IonPage, IonRow, IonToolbar } from '@ionic/react';
import axios from 'axios';

import { addOutline, closeOutline ,createOutline, saveOutline } from 'ionicons/icons';

const Imdb = (props: any) => {
     const columnSizes : any = (props.editingAllowed ? {'Action' : 2, 'Name' : 6,'IMDB URL' : 4} : {'Name' : 8,'IMDB URL' : 4});
     const [imdbAddName,setImdbAddName] = useState('');
     const [imdbAddURL,setImdbAddURL] = useState('');
     const [imdbFilter,setImdbFilter] = useState('');
     const [imdbPayload,setImdbPayload] = useState([]);
     const [imdbLoaded,setImdbLoaded] = useState(false);
     const [editingID,setEditingID] = useState(0);
     const [previousImdbPayload,setPreviousImdbPayload] = useState([]);

     const addIMDBClickHandler = () => {
          props.setIsAdding(true);      
     }

     const addIMDBNameChangeHandler = (event: any) => {
          setImdbAddName(event.target.value);
     }

     const addIMDBURLChangeHandler = (event: any) => {
          setImdbAddURL(event.target.value);
     }

     const cancelEditIMDBHandler = () => {
          let imdb : any = imdbPayload.filter((imdb: any) => imdb["IMDBID"] === editingID);

          if (imdb.length === 0) { // This shouldn't ever happen
               alert(`Unable to find the imdb entry with the ID ${editingID}`);
               return;
          }

          Object.assign(imdb[0],previousImdbPayload);

          props.setIsEditing(false);
     }

     const cancelNewIMDBHandler = async () => {
          setImdbAddName('');
          setImdbAddURL('');
          props.setIsAdding(false);
     }

     const editHandler = (imdbID: number) => {
          // Save the current imdb entry in case the user cancels
          const imdb : any = imdbPayload.filter((imdb: any) => imdb["IMDBID"] === imdbID);

          if (imdb.length === 0) { // This shouldn't ever happen
               alert(`Unable to find the imdb entry with the ID ${imdbID}`);
               return;
          }

          setPreviousImdbPayload(Object.assign({},imdb[0]));

          setEditingID(imdbID);
          props.setIsEditing(true);
     }

     const getImdb = useCallback(async () => {
          props.setIsLoading(true);

          await axios.get(`${props.backendURL}/GetIMDBNames`,{ headers: { "Authorization": `Bearer ${props.authorization}` }})
          .then((res: any)=> {
               setImdbPayload(res.data);
               setImdbLoaded(true);
               props.setIsLoading(false);
          })
          .catch((err: any)=> {
               alert(`An error occurred fetching the IMDB names with the error ${err.message}`);
          })
     },[props]);

     const imdbFilterChangeHandler = (event: any) => {
          setImdbFilter(event.target.value);
     }

     const rowUpdatedHandler = (imdbID: number,fieldName: string ,event: any) => {
          const imdb : any = imdbPayload.filter((imdb: any) => imdb["IMDBID"] === imdbID);

          if (imdb.length === 0) { // This should never happen!
               alert("Unable to locate the object imdb entry!");
               return;
          }

          imdb[0][fieldName] = event.target.value;
     }

     const saveEditIMDBHandler = async () => {
          let imdb : any = imdbPayload.filter((imdb: any) => imdb["IMDBID"] === editingID);

          if (imdb.length === 0) { // This shouldn't ever happen
               alert(`Unable to find the imdb entry with the ID ${editingID}`);
               return;
          }

          if (imdb[0].Name === "") {
               alert("You must enter the name");
               return;
          }

          if (imdb[0].IMDBURL === "") {
               alert("You must enter the IMDB URL");
               return;
          }

          await axios.put(`${props.backendURL}/UpdateIMDB?ID=${imdb[0].IMDBID}&Name=${imdb[0].Name}&URL=${imdb[0].URL}`,null,{ headers: { "Authorization": `Bearer ${props.authorization}` }})
          .then((res: any)=> {
               props.setIsEditing(false);
          })
          .catch((err: any) => {
               alert(`An error occurred updating the imdb entry with the ID ${imdb[0].IMDBID} with the error ${err.message}`);
          })          
     }

     const saveNewIMDBHandler = async () => {
          if (imdbAddName === '') {
               alert('Please enter the name');
               return;
          }

          if (imdbAddURL === '') {
               alert('Please enter the URL');
               return;
          }

          if (!imdbAddURL.startsWith('https://www.imdb.com') && !imdbAddURL.startsWith('https://m.imdb.com')) {
               alert('Please enter an IMDB URL');
               return;
          }

          await axios.put(`${props.backendURL}/UpdateIMDB?&Name=${imdbAddName}&URL=${imdbAddURL}`,null,{ headers: { "Authorization": `Bearer ${props.authorization}` }})
          .then((res: any) => {
               setImdbAddName('');
               setImdbAddURL('');
               props.setIsAdding(false);
          })
          .catch((err: any) => {
               alert(`An error occurred adding the imdb entry with the error ${err.message}`);
          }) 

         
     }
     
     async function searchNext($event: CustomEvent<void>) {
          getImdb();

          ($event.target as HTMLIonInfiniteScrollElement).complete();
     }

     useEffect(() => {
          if (!imdbLoaded) {
               getImdb();
          }

          if (props.editingAllowed) {

          }
     },[getImdb, imdbLoaded, props.editingAllowed]);

     return (
          <IonPage>
               <IonHeader>
                    <IonToolbar>
                    </IonToolbar>
               </IonHeader>

               <IonContent scrollX={true}>
                    {imdbLoaded && Object.keys(columnSizes).length > 0 && imdbLoaded &&
                         <IonGrid className="backgroundEEE sticky height140">                         
                              <>
                                   <IonRow>
                                        {!props.isEditing &&
                                             <>                     
                                                  <IonCol size="2" className="blackText narrowCell">
                                                       Filter
                                                  </IonCol>

                                                  <IonCol size="4">
                                                       <IonInput type="text" className="blackText removeBoxSizing underline" value={imdbFilter} onIonChange={imdbFilterChangeHandler} />
                                                  </IonCol>

                                                  <IonCol size="6"></IonCol>

                                                  <IonCol size="12">
                                                       <IonIcon icon={addOutline} className="blackText icon clickable" onClick={addIMDBClickHandler}></IonIcon>
                                                  </IonCol>
                                             </>
                                        }

                                        {(props.isEditing) &&
                                             <>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                                  <IonCol size="12" class="marginBottom30"></IonCol>
                                             </>
                                        }

                                        {Object.keys(columnSizes).map((key: string,index) => {
                                             return (
                                                  <IonCol key={index} size={columnSizes[key]} className="blackText tableHeader headerTextFont">{key}</IonCol>
                                             );
                                        })}
                                   </IonRow>
                              </>
                         </IonGrid>
                    }

                    {typeof imdbPayload !== 'undefined' &&
                         <IonInfiniteScroll threshold="100px" onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                              <IonInfiniteScrollContent loadingText="Loading imdb">
                                   {props.isAdding &&
                                        <IonRow>
                                             {props.editingAllowed &&
                                                  <>
                                                       <IonCol size={columnSizes['Action']} className="tableCell">
                                                            {!props.isAdding &&
                                                                 <IonIcon icon={createOutline} className="icon clickable"></IonIcon>
                                                            }

                                                            {props.isAdding &&
                                                                 <>
                                                                      <IonIcon icon={saveOutline} className="icon clickable" onClick={saveNewIMDBHandler}></IonIcon>
                                                                      <IonIcon icon={closeOutline} className="icon clickable leftMargin15" onClick={cancelNewIMDBHandler}></IonIcon>
                                                                 </>
                                                            }
                                                       </IonCol>

                                                       <IonCol size={columnSizes['Name']} className="tableCell">
                                                            <IonInput type="text" value={imdbAddName} onIonChange={addIMDBNameChangeHandler} />
                                                       </IonCol>

                                                       <IonCol size={columnSizes['URL']} className="tableCell">
                                                            <IonInput type="text" value={imdbAddURL} onIonChange={addIMDBURLChangeHandler} />
                                                       </IonCol>
                                                  </>                                                      
                                             }
                                        </IonRow>
                                   }

                                   {imdbPayload?.filter((imdb : any) => {                                                                                     
                                        if (imdbFilter === '')
                                             return imdb;
                                        else {
                                             return (
                                                  imdb.Name.toString().startsWith(imdbFilter)                                              
                                             )
                                        }
                                   })
                                   .map((imdb: any, index: number) => {
                                        return (
                                             <React.Fragment key={index}>
                                                  {(!props.isAdding && (!props.isEditing || (props.isEditing && editingID === imdb.IMDBID))) && 
                                                       <IonRow>
                                                            {props.editingAllowed &&                                                        
                                                                 <IonCol size={columnSizes['Action']} className="tableCell">
                                                                      {!props.isEditing &&
                                                                           <IonIcon icon={createOutline} className="icon clickable" onClick={() => editHandler(imdb.IMDBID)}></IonIcon>
                                                                      }
                                                                 
                                                                      {props.isEditing &&
                                                                           <>
                                                                                <IonIcon icon={saveOutline} className="icon clickable" onClick={saveEditIMDBHandler}></IonIcon>
                                                                                <IonIcon icon={closeOutline} className="icon clickable leftMargin15" onClick={cancelEditIMDBHandler}></IonIcon>
                                                                           </>
                                                                      }
                                                                 </IonCol>
                                                            }

                                                            <IonCol size={columnSizes['Name']} className="tableCell">
                                                                 {!props.isEditing && imdb.IMDBURL !== null &&
                                                                      <a href={imdb.IMDBURL} target="_blank" rel="noreferrer"><div className="textFont">{imdb.Name}</div></a>
                                                                 }

                                                                 {!props.isEditing && imdb.IMDBURL === null &&
                                                                      <div className="textFont">{imdb.Name}</div>
                                                                 }

                                                                 {props.isEditing && 
                                                                      <IonInput type="text" placeholder={imdb.Name} value={imdb.Name} onIonChange={(event: any) => rowUpdatedHandler(imdb.IMDBID,"Name",event)} />
                                                                 }
                                                            </IonCol>

                                                            <IonCol size={columnSizes['IMDB URL']} className="tableCell">
                                                                 {!props.isEditing &&
                                                                      <div className="textFont">{imdb.IMDBURL}</div>
                                                                 }

                                                                 {props.isEditing && 
                                                                      <IonInput type="text" placeholder={imdb.IMDBURL} value={imdb.IMDBURL} onIonChange={(event) => rowUpdatedHandler(imdb.IMDB,"IMDBURL",event)} />
                                                                 }
                                                            </IonCol>
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

export default Imdb;