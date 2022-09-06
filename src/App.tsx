// TODO: initialrecordcount-1 is retrieved
// TODO: After setting backend url doesnt load
import { useCallback, useEffect, useState} from "react";
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonButtons, IonCol, IonContent, IonIcon, IonGrid, IonHeader, IonInput, IonLabel, IonMenu, IonMenuButton, IonPage, IonRouterOutlet, IonRow, IonTabBar, IonTabButton, IonTabs, IonTitle, IonToggle, IonToolbar, setupIonicReact, IonSelect, IonSelectOption } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Episodes from './pages/Episodes';
import Imdb from './pages/Imdb';
import Loading from './components/Loading';
import { createStore, get, set, remove } from './components/Storage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Theme variables */
import './theme/variables.css';

import './App.css';

import { closeOutline, globeOutline, musicalNotesOutline, pencilOutline, saveOutline } from 'ionicons/icons';

setupIonicReact();

const App = () => {
     const [authorization,setAuthorization] = useState('');
     const [backendURL,setBackendURL] = useState('');
     const [checkoutAllowed,setCheckoutAllowed] = useState(false);
     const [editingAllowed,setEditingAllowed] = useState(false);
     const [episodeCheckInOutStatusLoaded,setEpisodeCheckInOutStatusLoaded] = useState(false);
     const [episodesLoaded,setEpisodesLoaded] = useState(false);
     const [episodesLoadingStarted,setEpisodesLoadingStarted] = useState(false);
     const [initialRecordCount,setInitialRecordCount] = useState(50);
     const [isAdding,setIsAdding] = useState(false);
     const [isEditing,setIsEditing] = useState(false);
     const [isEditingOptions,setIsEditingOptions] = useState(false);
     const [isError,setIsError] = useState(false);
     const [isLoading,setIsLoading] = useState(true);
     const [newAuthorization,setNewAuthorization] = useState('');
     const [newBackendURL,setNewBackendURL] = useState('');
     const [newCheckoutAllowed,setNewCheckoutAllowed] = useState(false);
     const [newEditingAllowed,setNewEditingAllowed] = useState(false);
     const [newInitialRecordCount,setNewInitialRecordCount] = useState(0);

     const cancelOptionsClickHandler = async () => {
          setIsEditingOptions(false);
     }

     const editOptionsClickHandler = async () => {
          setNewAuthorization(authorization);
          setNewBackendURL(backendURL);
          setNewCheckoutAllowed(checkoutAllowed);
          setNewEditingAllowed(editingAllowed);
          setNewInitialRecordCount(initialRecordCount);

          setIsEditingOptions(true);
     }

     const getConfigVars = useCallback(async () => {
          const newURL = await get('BackendURL');

          if (newURL !== "" && newURL !== null) {
               setBackendURL(newURL);
          } else {
               alert("Please set the backend URL");
               setIsError(true);
               return;
          }

          const auth = await get('Authorization');

          if (auth !== "" && auth !== null) {
               setAuthorization(auth);
          } else {
               alert("Please set the authorization");
               setIsError(true);
               return;
          }

          const newCheckoutAllowed = await get('CheckoutAllowed');

          if (newCheckoutAllowed !== "" && newCheckoutAllowed !== null) {
               setCheckoutAllowed(newCheckoutAllowed);
          } else {
               setCheckoutAllowed(false);
          }

          const newEditingAllowed = await get('EditingAllowed');

          if (newEditingAllowed !== "" && newEditingAllowed !== null) {
               setEditingAllowed(newEditingAllowed);
          } else {
               setEditingAllowed(false);
          }

          const newInitialRecordCount = await get('InitialRecordCount');

          if (newInitialRecordCount !== "" && newInitialRecordCount !== null) {
               setInitialRecordCount(newInitialRecordCount);
          } else {
               setInitialRecordCount(50);
          }
     },[]);

     const saveOptionsClickHandler = async () => {
          if (newBackendURL?.length === 0) {
               alert("Please enter the backend URL");
               return;
          }

          if (newAuthorization?.length === 0) {
               alert("Please enter the authorization");
               return;
          }

          setAuthorization(newAuthorization);
          setAuthorizationStorage(newAuthorization);

          setBackendURL(newBackendURL);
          setBackendURLStorage(newBackendURL);

          setCheckoutAllowed(newCheckoutAllowed);
          setCheckoutAllowedStorage(newCheckoutAllowed);

          setEditingAllowed(newEditingAllowed);
          setEditingAllowedStorage(newEditingAllowed);

          setInitialRecordCount(newInitialRecordCount);
          setInitialRecordCountStorage(newInitialRecordCount);

          setIsEditingOptions(false);
     }

     const setAuthorizationStorage = async (newAuthorization: string) => {
          if (newAuthorization !== null && newAuthorization !== "") {
               set('Authorization', newAuthorization);

               setAuthorization(newAuthorization);
           } else {
               await remove('Authorization');

               setAuthorization('');
           }
     }

     const setBackendURLStorage = async (newURL: string) => {
          if (newURL !== null && newURL !== "") {
               set('BackendURL', newURL);

               setBackendURL(newURL);
           } else {
               await remove('BackendURL');

               setBackendURL('');
           }
     }

     const setCheckoutAllowedStorage = async (newCheckoutAllowed: boolean) => {
          set('CheckoutAllowed', newCheckoutAllowed);

          setCheckoutAllowed(newCheckoutAllowed);
     }

     const setEditingAllowedStorage = async (newEditingAllowed: boolean) => {
          set('EditingAllowed', newEditingAllowed);

          setEditingAllowed(newEditingAllowed);
     }

     const setInitialRecordCountStorage = async (newInitialRecordCount: number) => {
          set('InitialRecordCount', newInitialRecordCount);

          setInitialRecordCount(newInitialRecordCount);
     }

     const setNewAuthorizationChangeHandler = (event: any) => {
          setNewAuthorization(event.target.value);
     }

     const setNewBackendURLChangeHandler = (event: any) => {
          setNewBackendURL(event.target.value);
     }

     const setNewCheckoutAllowedChangeHandler = (event: any) => {
          setNewCheckoutAllowed(event.target.value);
     }

     const setNewEditingAllowedChangeHandler = (event: any) => {
          setNewEditingAllowed(event.target.value);
     }

     const setNewInitialRecordCountChangeHandler = (event: any) => {
          setNewInitialRecordCount(event.target.value);
     }

     useEffect(() => {
          const setupStore = async () => {
			createStore("WTFIndexer");
		}

		setupStore();

          getConfigVars();
     },[getConfigVars]);

     return (
          <IonApp>
               <IonMenu contentId="menuContent" type="overlay" className="clickable ion-activatable">
                    <IonHeader>
                         <IonToolbar color="primary">
                              <IonTitle>WTF Indexer</IonTitle>
                         </IonToolbar>
                    </IonHeader>

                    <IonContent>
                         <IonGrid>
                              <IonRow>
                                   {!isEditingOptions && !isAdding && !isEditing &&
                                        <IonCol size="12">
                                             <IonIcon icon={pencilOutline} className="icon clickable" onClick={editOptionsClickHandler} ></IonIcon>
                                        </IonCol>
                                   }

                                   {isEditingOptions &&
                                        <IonCol size="10">
                                             <IonIcon icon={saveOutline} className="icon clickable" onClick={saveOptionsClickHandler} ></IonIcon>
                                        </IonCol>
                                   }

                                   {isEditingOptions &&
                                        <IonCol size="2">
                                              <IonIcon icon={closeOutline} className="icon clickable" onClick={cancelOptionsClickHandler} ></IonIcon>
                                        </IonCol>
                                   }
                              </IonRow>

                              <IonRow>
                                   {backendURL !== '' && authorization !== '' &&
                                        <>
                                             <IonCol size="6">
                                                  Checkout Allowed
                                             </IonCol>

                                             <IonCol size="6">
                                                  <IonToggle disabled={!isEditingOptions} checked={(!isEditing ? checkoutAllowed : newCheckoutAllowed)} onIonChange={setNewCheckoutAllowedChangeHandler}></IonToggle>
                                             </IonCol>

                                             <IonCol size="12"></IonCol>

                                             <IonCol size="6">
                                                  Editing Allowed
                                             </IonCol>

                                             <IonCol size="6">
                                                  <IonToggle disabled={!isEditingOptions} checked={(!isEditing ? editingAllowed : newEditingAllowed)} onIonChange={setNewEditingAllowedChangeHandler}></IonToggle>
                                             </IonCol>

                                             <IonCol size="12"></IonCol>

                                             <IonCol size="12">
                                                  Initial Record Count
                                             </IonCol>

                                             <IonCol size="12">
                                                  <IonSelect disabled={!isEditingOptions} onIonChange={setNewInitialRecordCountChangeHandler} className="dashed-border" value={(!isEditing ? initialRecordCount : newInitialRecordCount)}>
                                                  {
                                                       ["10","25","50","100","500","1000","5000"].map((recordCount : any,index: number) => {
                                                            return <IonSelectOption key={index} value={recordCount}>{recordCount}</IonSelectOption>
                                                       })
                                                  }
                                                  </IonSelect>
                                             </IonCol>

                                             <IonCol size="12"></IonCol>
                                             <IonCol size="12"></IonCol>
                                        </>
                                   }
                                   
                                   <IonCol size="12">
                                        Backend URL
                                   </IonCol>

                                   <IonCol size="12">
                                        {!isEditingOptions &&
                                             <IonLabel>{backendURL}</IonLabel>
                                        }

                                        {isEditingOptions &&
                                             <IonInput className="dashed-border" disabled={!isEditingOptions} type="text" value={newBackendURL} onIonChange={setNewBackendURLChangeHandler} />
                                        }
                                   </IonCol>

                                   <IonCol size="12"></IonCol>
                                   <IonCol size="12"></IonCol>

                                   <IonCol size="12">
                                        Auth Token
                                   </IonCol>

                                   {!isEditingOptions &&
                                        <IonCol size="12">
                                             {authorization.length > 0 &&
                                                  "*".repeat(authorization.length)
                                             }
                                        </IonCol>
                                   }

                                   {isEditingOptions &&
                                        <IonCol size="12">
                                             <IonInput className="dashed-border" type="password" value={newAuthorization} onIonChange={setNewAuthorizationChangeHandler} />
                                        </IonCol>
                                   }
                              </IonRow>                              
                         </IonGrid>
                    </IonContent>
               </IonMenu>

               <IonHeader>
                    <IonToolbar>
                         <IonGrid>
                              <IonRow>
                                   <IonCol size="1">
                                        <IonButtons id="menuButtons">
                                             <IonMenuButton></IonMenuButton>
                                        </IonButtons>
                                   </IonCol>

                                   
                                   <IonCol size="5"></IonCol>

                                   <IonCol size="6">
                                        <IonTitle>WTF Indexer App</IonTitle>
                                   </IonCol>
                              </IonRow>                              
                         </IonGrid>
                    </IonToolbar>
               </IonHeader>

               <IonReactRouter>
                    <IonPage>
                         {!isError &&
                              <IonTabs>
                                   <IonRouterOutlet id="menuContent">
                                        <Route path="/episodes" exact={true}>
                                             <Episodes authorization={authorization} backendURL={backendURL} checkoutAllowed={checkoutAllowed} episodeCheckInOutStatusLoaded={episodeCheckInOutStatusLoaded} episodesLoaded={episodesLoaded} episodesLoadingStarted={episodesLoadingStarted} initialRecordCount={initialRecordCount} isAdding={isAdding} isEditing={isEditing} isLoading={isLoading} setIsAdding={setIsAdding} editingAllowed={editingAllowed} setEpisodeCheckInOutStatusLoaded={setEpisodeCheckInOutStatusLoaded} setEpisodesLoaded={setEpisodesLoaded} setEpisodesLoadingStarted={setEpisodesLoadingStarted} setIsEditing={setIsEditing} setIsLoading={setIsLoading}/>
                                        </Route>
                                   
                                        <Route path="/imdb" exact={true}>
                                             <Imdb authorization={authorization} backendURL={backendURL} editingAllowed={editingAllowed} isAdding={isAdding} isEditing={isEditing} isLoading={isLoading} setEpisodeCheckInOutStatusLoaded={setEpisodeCheckInOutStatusLoaded} setIsAdding={setIsAdding} setIsEditing={setIsEditing} setIsLoading={setIsLoading} />
                                        </Route>
                                   
                                        <Route exact path="/" render={() => <Redirect to="/episodes" />} />
                                   </IonRouterOutlet>
                         
                                   <IonTabBar slot="bottom">
                                        <IonTabButton tab="episodes" href="/episodes">
                                             <IonIcon icon={musicalNotesOutline}></IonIcon>
                                             <IonLabel>Episodes</IonLabel>                                   
                                        </IonTabButton>

                                        <IonTabButton tab="imdb" href="/imdb">
                                             <IonIcon icon={globeOutline}></IonIcon>
                                             <IonLabel>IMDB</IonLabel>
                                        </IonTabButton>
                                   </IonTabBar>
                              </IonTabs>
                         }
                    </IonPage>
               </IonReactRouter>

               {isLoading && !isError &&
                    <Loading />
               }
          </IonApp>
     )
}

export default App;