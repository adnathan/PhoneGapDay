import {Page} from 'ionic/ionic';
import {ConferenceData} from '../../providers/conference-data';


@Page({
  templateUrl: 'build/pages/map/map.html'
})
export class MapPage {
  constructor(confData: ConferenceData) {
    this.confData = confData;
  }

  onPageDidEnter() {
    if (!window.showNativeNavBar()) {
        var elements = window.document.getElementsByClassName("nav-bar-dynamic");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "block";
        }
    }

    this.confData.getMap().then(mapData => {
        let mapEle = document.getElementById('map');
        try {
            let map = new google.maps.Map(mapEle, {
                center: mapData.find(d => d.center),
                zoom: 9
            });

            mapData.forEach(markerData => {
                let infoWindow = new google.maps.InfoWindow({
                    content: `<h5>${markerData.name}</h5>`
                });

                let marker = new google.maps.Marker({
                    position: markerData,
                    map: map,
                    title: markerData.name
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });

                google.maps.event.addListenerOnce(map, 'idle', () => {
                    mapEle.classList.add('show-map');
                });
            });
        }
        catch (ex) {
            // Show a static map
            mapEle.style.backgroundImage = "url(img/map.jpg)";
            mapEle.style.backgroundSize = "cover";
            mapEle.classList.add('show-map');
            console.error("Error loading map: " + ex);
        }
    });
  }
}
