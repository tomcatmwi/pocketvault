import { Component, ViewContainerRef, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Page } from 'tns-core-modules/ui/page/page';
import { SearchFormComponent } from '~/app/modals/search-form/search-form.component';
import { AppService } from '~/app/services/app.service';
import { Store, select } from '@ngrx/store';
import { VaultCollection, Icon } from '~/app/state/vault/vault.state';
import { SwitchCollection } from '~/app/state/vault/vault.actions';
import { Subscription } from 'rxjs';
import { vault } from '~/app/app.state';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { Router } from '@angular/router';

export interface SearchOptions {
  search: string;
  itemTitles: boolean;
  itemValues: boolean;
  collections: boolean;
}

//  Search result
//  Can store items or collections
export interface SearchResult {
  itemName?: string,
  itemId?: string,
  itemComment?: string,
  collectionName?: string,
  collectionId?: string,
  icon?: Icon
}

@Component({
  selector: 'ns-search',
  templateUrl: './search.component.html'
})
export class SearchComponent {

  constructor(
    private _appService: AppService,
    private _store: Store<any>,
    private _page: Page,
    private _router: Router,
    private _modalService: ModalDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _location: Location,
  ) { }

  collections: SearchResult[] = [];

  items: SearchResult[] = [];

  private _subscriptions: Subscription[] = [];
  private _vault: string | VaultCollection[];
  private _searchOpen: boolean;

  @HostListener('loaded')
  pageInit() {

    this._appService.sideDrawer = true;

    this._subscriptions.push(
      this._store.pipe(
        select(vault)
      ).subscribe(vault => {
        this._vault = vault.data;
      })
    );

    this.startSearch();
  }

  startSearch() {

    //  This flag is needed or the modal opens twice
    //  Known NativeScript bug which seems to occur randomly
    if (this._searchOpen) return;

    if (this._appService.isAndroid)
      this._page.off('BackButton');

    const options: ModalDialogOptions = {
      viewContainerRef: this._viewContainerRef,
      fullscreen: true,
      context: null
    };

    this._searchOpen = true;

    this._modalService.showModal(SearchFormComponent, options)
      .then((res: SearchOptions) => {
        this._searchOpen = false;
        if (!res) return;

        //  Clear current results
        this.collections = [];
        this.items = [];

        const collections: SearchResult[] = [];
        const items: SearchResult[] = [];

        const rx = new RegExp(res.search, 'gi');

        //  Recursive search in the vault
        const search = (coll) => {

          const tempItems = coll.items.sort((a, b) => a.name < b.name ? -1 : 1);

          tempItems.forEach(i => {
            if ((res.itemTitles && i.name.match(rx)) ||
              (res.itemValues && i.name.match(rx)))
              items.push({
                itemId: i.id,
                itemName: i.name,
                itemComment: i.comment || null,
                collectionName: coll.name || null,
                collectionId: coll.id || null
              });
          });

          coll.collections.forEach(c => {
            if (res.collections && c.name.match(rx))
              collections.push({
                collectionId: c.id,
                collectionName: c.name,
                icon: c.icon
              });
            search(c);
          });
        }

        //  Search vault
        search(this._vault);

        //  Order results by collection name
        this.collections = collections.sort((a, b) => a.collectionName < b.collectionName ? -1 : 1);
        this.items = items.sort((a, b) => a.collectionName < b.collectionName ? -1 : 1);
      });
  }

  gotoMain() {
    this._router.navigate(['/main']);
  }

  goBack() {
    this._location.back();
  }

  tapSearchResult(id) {
    this._store.dispatch(new SwitchCollection(id));
    this.gotoMain();
  }

  @HostListener('unloaded')
  pageDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

}
