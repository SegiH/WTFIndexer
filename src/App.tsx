import { useEffect, useState} from "react";
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonCol, IonIcon, IonGrid, IonHeader, IonLabel, IonPage, IonRouterOutlet, IonRow, IonTabBar, IonTabButton, IonTabs, IonTitle, IonToolbar, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Episodes from './pages/Episodes';
import Imdb from './pages/Imdb';
import Loading from './components/Loading';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Theme variables */
import './theme/variables.css';

import './App.css';

import { globeOutline, musicalNotesOutline } from 'ionicons/icons';

setupIonicReact();

const App = () => {
     const [authorization,setAuthorization] = useState('');
     const [backendURL,setBackendURL] = useState('');
     const [checkoutAllowed,setCheckoutAllowed] = useState(false);
     const [editingAllowed,setEditingAllowed] = useState(false);
     const [episodeCheckInOutStatusLoaded,setEpisodeCheckInOutStatusLoaded] = useState(false);
     const [episodesLoaded,setEpisodesLoaded] = useState(false);
     const [episodesLoadingStarted,setEpisodesLoadingStarted] = useState(false);

     const [isAdding,setIsAdding] = useState(false);
     const [isEditing,setIsEditing] = useState(false);
     const [isError,setIsError] = useState(false);
     const [isLoading,setIsLoading] = useState(true);
     
     const configData = require(".//assets/default.json");

     const initialRecordCount = (typeof configData["InitialRecordCount"] !== 'undefined' ? configData["InitialRecordCount"] : 100);

     useEffect(() => {
          try {
               if (typeof configData["Authorization"] === 'undefined') {
                    alert("A fatal error occurred reading the property Authorization. Please check the config file at assets/default.json");
                    setIsError(true);
                    return;
               } else if (typeof configData["Authorization"] !== 'undefined' && configData["Authorization"] === "") {
                    alert("The property Authorization is not set. Please check the config file at assets/default.json");
                    setIsError(true);
                    return;
               } else {
                    setAuthorization(configData["Authorization"]);
               }

               if (typeof configData["BackendURL"] === 'undefined') {
                    alert("A fatal error occurred reading the property BackendURL from config data. Please check the config file at assets/default.json")
                    setIsError(true);
                    return;
               } else {
                    setBackendURL(configData["BackendURL"]);
               }

               if (typeof configData["CheckoutAllowed"] === 'undefined') {
                    alert("A fatal error occurred reading the property CheckoutAllowed from config data. Please check the config file at assets/default.json")
                    setIsError(true);
                    return;
               } else {
                    setCheckoutAllowed(configData["CheckoutAllowed"]);
               }

               if (typeof configData["EditingAllowed"] === 'undefined') {
                    alert("A fatal error occurred reading the property EditingAllowed from config data. Please check the config file at assets/default.json")
                    setIsError(true);
                    return;  
               } else {
                    setEditingAllowed(configData["EditingAllowed"]);
               }
          } catch(err) {
               alert("A fatal error occurred reading the config data in App component. Please check the config file at assets/default.json")
          }
     },[configData]);

     return (
          <IonApp>
               <IonReactRouter>
                    <IonPage id="main">
                         <IonHeader>
                              <IonToolbar>
                                   <IonGrid>
                                        <IonRow>
                                             <IonCol size="6">
                                                  <IonTitle>WTF Indexer App</IonTitle>
                                             </IonCol>

                                             <IonCol size="6"></IonCol>
                                        </IonRow>                              
                                   </IonGrid>
                              </IonToolbar>
                         </IonHeader>

                         {!isError &&
                         <IonTabs>
                              <IonRouterOutlet>
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