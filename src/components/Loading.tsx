import React, {} from "react";
import { IonCol, IonGrid, IonRow } from '@ionic/react';

const Loading = () => {
     return (
          <IonGrid>
               <IonRow>
	               <IonCol>
                         <div className="app-loading">
                              <span className="loading">Loading...</span>
                              <div className="logo"></div>
                                             
                              <svg className="spinner" viewBox="25 25 50 50">
                                   <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
                              </svg>
                         </div>
		          </IonCol>
               </IonRow>
          </IonGrid>
     )
}

export default Loading;