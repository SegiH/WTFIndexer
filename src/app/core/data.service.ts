import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IMDBNames,IWTFEpisode } from './interfaces';

@Injectable()
export class DataService {
    constructor(private http: HttpClient) { }

    checkEpisodeInOut(epNumber,isCheckedOut) {
      return this.http.get<any>('WTF.php?CheckInOut&EpisodeNumber=' + epNumber + '&IsCheckedOut=' + isCheckedOut)
      .pipe(
        catchError(this.handleError)
      );
    }

    getEpisodes() : any {
        return this.http.get<IWTFEpisode[]>('WTF.php?FetchData')
        .pipe(
          catchError(this.handleError)
        );
    }

    getIMDBNames() : any {
      return this.http.get<IMDBNames[]>('WTF.php?FetchIMDBNames')
      .pipe(
        catchError(this.handleError)
      );
    }

    scrapeData() : any {
        return this.http.get<any>('WTF.php?ScrapeData')
        .pipe(
          catchError(this.handleError)
        );
    }

    // Save the favorite value for the specific episode to the database
    updateEpisodeFavorite(epNumber,favoriteValue) {
        return this.http.get<any>('WTF.php?UpdateFavorite&EpisodeNumber=' + epNumber + "&FavoriteValue=" + favoriteValue)
        .pipe(
          catchError(this.handleError)
        );
    }

    updateEpisodes(episodePayload) {
      return this.http.get<any>('WTF.php?UpdateEpisodes&EpisodePayload=' + JSON.stringify(episodePayload))
      .pipe(
        catchError(this.handleError)
      );
    }

    updateIMDB(imdbPayload) {
      return this.http.get<any>('WTF.php?UpdateIMDB&IMDBPayload=' + JSON.stringify(imdbPayload))
      .pipe(
        catchError(this.handleError)
      );
    }

    private handleError(error: any) {
      if (error.error instanceof Error) {
          const errMessage = error.error.message;
          return throwError(errMessage);
          // Use the following instead if using lite-server
          // return Observable.throw(err.text() || 'backend server error');
      }
      return throwError(error || 'Node.js server error');
    }
}