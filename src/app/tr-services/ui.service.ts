import { Injectable } from '@angular/core';
import { ButtonState, TabState } from '../tr-enums/ui-state';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UiService {
    constructor() {}

    // stores the active tab
    private _tab = new BehaviorSubject<TabState>(TabState.Build);
    tab$ = this._tab.asObservable();

    // stores the active button inside the build tab
    // default is empty
    private _button = new BehaviorSubject<ButtonState | null>(null);
    button$ = this._button.asObservable();

    // Indicates, when the user switches between tabs.
    // When the user switches tabs, this variable is set to true for
    // 1.1 s and then reset again to false.
    // This allows for smooth transitions of the fill for active petri net
    // transitions when tab changes to and from play mode occur. Other fill changes
    // for petri net transitions during the token game are still displayed
    // instantaneously.
    tabTransitioning: boolean = false;

    set tab(value: TabState) {
        this._tab.next(value);
    }

    get tab(): TabState {
        return this._tab.getValue();
    }

    set button(value: ButtonState | null) {
        this._button.next(value);
    }

    get button(): ButtonState | null {
        return this._button.getValue();
    }
}
