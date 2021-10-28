import { Component, OnInit } from '@angular/core';
import { Observable, EMPTY } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

declare const google: any;

interface Marker {
    lat: number;
    lng: number;
    label?: string;
    draggable?: boolean;
}

interface Vehicle {
    id: string;
    packageId: string;
    plate: string;
    nationalId: string;
}

interface Telemetry {
    vehicleId: string,
    odometer: {
        value: number,
        metric: string
    },
    location: {
        latitude: number,
        longitude: number
    },
    batteryVoltage: number,
    fuelLevel: number
}

@Component({
    selector: 'app-maps',
    templateUrl: './maps.component.html',
    styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit {
    baseUrl = "https://fiap-api.apps.pd01e.edc1.cf.ford.com/";
    vehicles: Vehicle[] = [];
    constructor(private http: HttpClient) { }

    ngOnInit() {



        var myLatlng = new google.maps.LatLng(-14.13533, -64.52121);
        var mapOptions = {
            zoom: 13,
            center: myLatlng,
            scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
            styles: [{
                "featureType": "water",
                "stylers": [{
                    "saturation": 43
                }, {
                    "lightness": -11
                }, {
                    "hue": "#0088ff"
                }]
            }, {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{
                    "hue": "#ff0000"
                }, {
                    "saturation": -100
                }, {
                    "lightness": 99
                }]
            }, {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "color": "#808080"
                }, {
                    "lightness": 54
                }]
            }, {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#ece2d9"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#ccdca1"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#767676"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "color": "#ffffff"
                }]
            }, {
                "featureType": "poi",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "landscape.natural",
                "elementType": "geometry.fill",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#b8cb93"
                }]
            }, {
                "featureType": "poi.park",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "poi.sports_complex",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "poi.medical",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "poi.business",
                "stylers": [{
                    "visibility": "simplified"
                }]
            }]

        };
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        this.getVehicles().subscribe(vehicles => {
            this.vehicles = vehicles.slice(42, 63)
            this.vehicles.map((vehicle) => {
                this.getTelemetria(vehicle.id).subscribe(telemetry => {
                    const marker = new google.maps.Marker({
                        position: new google.maps.LatLng(telemetry[0].location.latitude, telemetry[0].location.longitude),
                        title: "Placa Carro: "+vehicle.plate
                    });
                    marker.setMap(map)
                })
            });
        })
    }

    getVehicles(): Observable<Vehicle[]> {
        return this.http.get<Vehicle[]>(this.baseUrl + "vehicles").pipe(
            map((obj) => obj),
            catchError((e) => EMPTY)
        );
    }

    getTelemetria(idVehicle): Observable<Telemetry[]> {
        return this.http.get<Telemetry[]>(this.baseUrl + 'vehicles/' + idVehicle + '/telemetry').pipe(
            map((obj) => obj),
            catchError((e) => EMPTY)
        );
    }

}
