import {Injectable} from 'angular2/core';


@Injectable()
export class UserData {

  constructor() {
    this._favorites = [];
    if (window.localStorage["favorites"]) {
      this._favorites = JSON.parse(window.localStorage["favorites"]);
    }
  }

  hasFavorite(sessionName) {
    return (this._favorites.indexOf(sessionName) > -1);
  }

  addFavorite(sessionName) {
    this._favorites.push(sessionName);
    window.localStorage["favorites"] = JSON.stringify(this._favorites);
  }

  removeFavorite(sessionName) {
    let index = this._favorites.indexOf(sessionName)
    if (index > -1) {
      this._favorites.splice(index, 1);
      window.localStorage["favorites"] = JSON.stringify(this._favorites);
    }
  }

}
