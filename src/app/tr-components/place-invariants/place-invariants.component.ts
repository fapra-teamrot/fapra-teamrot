import { Component } from '@angular/core';
import { PlaceInvariantsService } from 'src/app/tr-services/place-invariants.service';

@Component({
    selector: 'app-place-invariants',
    templateUrl: './place-invariants.component.html',
    styleUrls: ['./place-invariants.component.css']
})
export class PlaceInvariantsComponent {

    constructor(protected placeInvariantsService: PlaceInvariantsService) {

    }

    placeInvariants() {
        throw new Error('Method not implemented.');
    }

}
