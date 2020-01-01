import { Component, ViewChild, ViewContainerRef, HostListener } from '@angular/core';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { CardView } from '@nstudio/nativescript-cardview';
import { registerElement } from 'nativescript-angular/element-registry';
import { Menu } from 'nativescript-menu';
import { Page, View } from 'tns-core-modules/ui/page/page';
import { TranslateService } from '~/app/services/translate.service';
import { NewCollectionComponent } from '~/app/modals/new-collection/new-collection.component';
import { NewItemComponent } from '~/app/modals/new-item/new-item.component';
import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';
import { VaultCollection, VaultItem } from '~/app/state/vault/vault.state';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { formatTime } from '~/app/utils';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import * as moment from 'moment';
import { ListViewEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { AppService } from '~/app/services/app.service';
import { Store, select } from '@ngrx/store';
import { currentCollection, settings, lastVaultChange, clipboard } from '~/app/app.state';
import {
  AddCollection,
  AddItem,
  DeleteCollection,
  DeleteItem,
  Reorder,
  SwitchCollection,
  SwitchCollectionUp,
  Save,
  Copy
} from '~/app/state/vault';
import { Settings } from '~/app/state/settings';
import { ToastyService } from '~/app/services/toasty.service';

registerElement('CardView', () => CardView);

@Component({
  selector: 'ns-main',
  templateUrl: './main.component.html'
})
export class MainComponent {

  @ViewChild('collectionList', { static: false }) collectionList: RadListViewComponent;
  @ViewChild('itemList', { static: false }) itemList: RadListViewComponent;

  //  Popup menus
  addMenuActions = [
    { id: 0, title: 'main.add-menu.new-collection' },
    { id: 1, title: 'main.add-menu.new-item' },
    { id: 2, title: 'main.add-menu.rearrange' },
    { id: 3, title: 'main.add-menu.paste' }
  ];

  itemMenuActions = [
    { id: 0, title: 'main.item-menu.cut' },
    { id: 1, title: 'main.item-menu.copy' },
    { id: 2, title: 'main.item-menu.edit' },
    { id: 3, title: 'main.item-menu.delete' },
    { id: 4, title: 'main.item-menu.show-creation' },
  ];

  collectionMenuActions = [
    { id: 0, title: 'main.collection-menu.cut' },
    { id: 1, title: 'main.collection-menu.copy' },
    { id: 2, title: 'main.item-menu.edit' },
    { id: 3, title: 'main.item-menu.delete' },
    { id: 4, title: 'main.item-menu.show-creation' },
  ];

  //  The current collections and items (for the RadListView)
  collections: ObservableArray<VaultCollection>;
  items: ObservableArray<VaultItem>;
  title: string;

  //  The collection and item currently open (RadListView hack, see the template)
  currentCollection: VaultCollection;
  currentItem: VaultItem;
  settings: Settings;

  //  Others
  allowRearrange: boolean = false;

  private _subscriptions: Subscription[] = [];
  private _clipboard;

  constructor(
    private _translateService: TranslateService,
    private _page: Page,
    private _modalService: ModalDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _appService: AppService,
    private _store: Store<any>,
    private _toastyService: ToastyService,
  ) { }

  //  Don't use OnInit and OnDestroy as you would in Angular web!
  //  NativeScript doesn't destroy the component upon leaving the page, and
  //  therefore ngOnDestroy must be called explicitly to unsubscribe observables.
  //  ngOnInit is also called only once when first navigating to the page.

  @HostListener('loaded')
  pageInit() {

    console.log('Page init called!');

    //  Android hardware back button handler
    this._initBackButton();
    this._appService.sideDrawer = true;

    this._translateService.translateBatch(this.addMenuActions, null, 'title');
    this._translateService.translateBatch(this.collectionMenuActions, null, 'title');
    this._translateService.translateBatch(this.itemMenuActions, null, 'title');

    //  Watch clipboard and enable/disable Paste menu
    this._subscriptions.push(
      this._store.pipe(
        select(clipboard)
      ).subscribe(clipboard => {
        if (clipboard.collection || clipboard.item)
          this.addMenuActions[3] = { id: 3, title: this._translateService.translate('main.add-menu.paste') }
        else
          this.addMenuActions.length = 3;

        this._clipboard = clipboard;
      })
    );

    //  Get settings
    this._subscriptions.push(
      this._store.pipe(
        select(settings)
      ).subscribe(settings => {
        this.settings = settings;
      })
    );

    //  Get current vault
    this._subscriptions.push(
      this._store.pipe(
        select(currentCollection),
      ).subscribe(vault => {
        this.title = !!vault['name'] ? vault['name'] : null;
        this.collections = new ObservableArray(!!vault['collections'] ? vault['collections'].slice(0) : []);
        this.items = new ObservableArray(!!vault['items'] ? vault['items'].slice(0) : []);
      })
    );

    //  Watch vault changes, save on any change
    this._subscriptions.push(
      this._store.pipe(
        select(lastVaultChange),
        distinctUntilChanged()
      ).subscribe(x => {
        if (x > 0) this._saveVault();
      })
    );

  }

  copyToClipboard() {
    if (this.currentItem.value)
      this._appService.copyToClipboard(this.currentItem.value);
    this.itemSwipeClose();
  }

  //  RadListView currently doesn't allow swipe and drag at the same time :(
  rearrangeEnable(forced?: boolean) {
    if (typeof forced !== 'undefined') {
      if (forced === this.allowRearrange) return;
      this.allowRearrange = forced;
    }
    else
      this.allowRearrange = !this.allowRearrange;

    if (!this.allowRearrange) {
      this._toastyService.toasty(this._translateService.translate('main.rearrange-disabled'));
      this._store.dispatch(new Save());
    } else
      this._toastyService.toasty(this._translateService.translate('main.rearrange-enabled'));
  }

  //  Goes one collection up
  goUp() {
    this._store.dispatch(new SwitchCollectionUp());
  }

  //  Opens the side drawer to add a new element
  tapAddButton() {
    Menu.popup({
      view: this._page.getViewById('addButton'),
      actions: this.addMenuActions,
    })
      .then(action => {

        const options: ModalDialogOptions = {
          viewContainerRef: this._viewContainerRef,
          fullscreen: true,
          context: {
            id: null
          }
        };

        this._deinitBackButton();

        switch (action.id) {
          case 0:
            this._modalService.showModal(NewCollectionComponent, options)
              .then(res => {
                this._initBackButton();
                if (!res) return;
                this._addCollection(res);
              });
            break;
          case 1:
            this._modalService.showModal(NewItemComponent, options)
              .then(res => {
                this._initBackButton();
                if (!res) return;
                this._addItem(res);
              });
            break;

          case 2: this.rearrangeEnable(); break;
          case 3: this._paste(); break;
        }
      })
  }

  //  Shows the local menu for a collection
  collectionMenu(event) {
    Menu.popup({
      view: event.object,
      actions: this.collectionMenuActions,
    })
      .then(action => {
        this.itemSwipeClose();

        switch (action.id) {
          case 0: this.copyCollection(true); break;
          case 1: this.copyCollection(); break;
          case 2: this.editCollection(); break;
          case 3: this.deleteCollection(); break;
          case 4: this.showDateCollection(this.currentCollection); break;
        }
      });
  }

  //  Shows the local menu for an item
  itemMenu(event) {
    Menu.popup({
      view: event.object,
      actions: this.itemMenuActions,
    })
      .then(action => {
        this.itemSwipeClose();

        switch (action.id) {
          case 0: this.copyItem(true); break;
          case 1: this.copyItem(); break;
          case 2: this.editItem(); break;
          case 3: this.deleteItem(); break;
          case 4: this.showDateItem(this.currentItem); break;
        }
      });
  }

  //  Cuts or copies the current item
  copyItem(cut?: boolean) {
    this._store.dispatch(new Copy({ collection: null, item: this.currentItem }));
    if (cut)
      this._store.dispatch(new DeleteItem(this.currentItem.id));
    this._toastyService.toasty(this._translateService.translate('general.clipboard-copied'));
  }

  //  Cuts or copies the current collection
  copyCollection(cut?: boolean) {
    this._store.dispatch(new Copy({ collection: this.currentCollection, item: null }));
    if (cut)
      this._store.dispatch(new DeleteCollection(this.currentCollection.id));
    this._toastyService.toasty(this._translateService.translate('general.clipboard-copied'));
  }

  //  Display collection creation date on double tap
  showDateCollection(collection: VaultCollection) {
    const date = new Date(collection.created);
    dialogs.alert({
      title: this._translateService.translate('main.creation-date-title'),
      message: this._translateService.translate('main.creation-date-collection') +
        moment(date).format(String(this.settings.locale.dateFormat)) +
        ' ' + formatTime(date),
      okButtonText: this._translateService.translate('general.ok-button')
    });
  }

  //  Display item creation date on double tap
  showDateItem(item: VaultItem) {
    const created = new Date(item.created);
    const modified = new Date(item.lastModified) || null;
    let message = this._translateService.translate('main.creation-date-item') +
      moment(created).format(String(this.settings.locale.dateFormat)) + ' ' + formatTime(created);

    if (modified)
      message += '\n\n' +
        this._translateService.translate('main.modified-date-item') +
        moment(modified).format(String(this.settings.locale.dateFormat)) + ' ' + formatTime(modified);

    dialogs.alert({
      title: this._translateService.translate('main.creation-date-title'),
      message: message,
      okButtonText: this._translateService.translate('general.ok-button')
    });
  }

  tapCollection(id) {
    this._store.dispatch(new SwitchCollection(id));
  }

  deleteCollection() {
    this.collectionSwipeClose();
    dialogs.confirm({
      title: this._translateService.translate('main.delete-collection-modal-title'),
      message: this._translateService.translate('main.delete-collection-modal', { name: this.currentCollection.name }),
      okButtonText: this._translateService.translate('general.yes-button'),
      cancelButtonText: this._translateService.translate('general.no-button')
    }).then(res => {
      if (!res) return;
      this._store.dispatch(new DeleteCollection(this.currentCollection.id));
    });
  }

  editCollection() {
    this.collectionSwipeClose();

    const options: ModalDialogOptions = {
      viewContainerRef: this._viewContainerRef,
      fullscreen: true,
      context: this.currentCollection
    };

    this._deinitBackButton();

    this._modalService.showModal(NewCollectionComponent, options)
      .then(res => {
        this._initBackButton();
        if (!res) return;

        this._addCollection({
          id: this.currentCollection.id,
          name: res.name,
          icon: res.icon
        });
      });
  }

  deleteItem() {
    this.itemSwipeClose();
    dialogs.confirm({
      title: this._translateService.translate('main.delete-item-modal-title'),
      message: this._translateService.translate('main.delete-item-modal'),
      okButtonText: this._translateService.translate('general.yes-button'),
      cancelButtonText: this._translateService.translate('general.no-button')
    }).then(res => {
      if (!res) return;
      this._store.dispatch(new DeleteItem(this.currentItem.id));
    });
  }

  editItem() {
    const options: ModalDialogOptions = {
      viewContainerRef: this._viewContainerRef,
      fullscreen: true,
      context: this.currentItem
    };

    this._deinitBackButton();
    this._modalService.showModal(NewItemComponent, options)
      .then(res => {
        this._initBackButton();
        if (!res) return;
        this._addItem({
          id: this.currentItem.id,
          ...res
        });
      });
  }

  showItem() {
    dialogs.alert({
      title: this.currentItem.name,
      message: this.currentItem.value,
      okButtonText: this._translateService.translate('general.ok-button')
    });
  }

  //  Called when an item on the collection list is swiped
  //  Looks at the delete button's width (because all buttons should be the same width) and adjusts the
  //  width of the revealed area accordingly.
  collectionSwipeStart(event: ListViewEventData) {

    this.currentCollection = this.collections.getItem(event.index);

    const swipeLimits = event.data.swipeLimits;
    const btnWidth = event.object.getViewById<View>('menuButton').getMeasuredWidth();

    swipeLimits.left = 0;                           //  nothing to reveal on the left side
    swipeLimits.right = btnWidth;                   //  how wide area should swipe reveal on the right?
    swipeLimits.threshold = btnWidth * 0.5;         //  how long swiping will reveal the buttons under the item?
  }

  collectionSwipeClose() {
    this.collectionList.listView.notifySwipeToExecuteFinished();
  }

  itemSwipeStart(event: ListViewEventData) {

    this.currentItem = this.items.getItem(event.index);

    const swipeLimits = event.data.swipeLimits;
    const btnWidth = event.object.getViewById<View>('menuButton').getMeasuredWidth();

    swipeLimits.left = 0;                                       //  nothing to reveal on the left side
    swipeLimits.right = this._appService.screen.widthPixels;    //  how wide area should swipe reveal on the right?
    swipeLimits.threshold = btnWidth * 0.5;                     //  how long swiping will reveal the buttons under the item?
  }

  itemSwipeClose() {
    this.itemList.listView.notifySwipeToExecuteFinished();
  }

  reorderCollection(event: ListViewEventData) {
    this._store.dispatch(new Reorder({ source: event.index, target: event.data.targetIndex, reorderWhat: 0 }));
  }

  reorderItem(event: ListViewEventData) {
    this._store.dispatch(new Reorder({ source: event.index, target: event.data.targetIndex, reorderWhat: 1 }));
  }

  //  Paste contents of the clipboard into the current collection
  private _paste() {
    if (this._clipboard.item) this._store.dispatch(new AddItem(this._clipboard.item));
    if (this._clipboard.collection) this._store.dispatch(new AddCollection(this._clipboard.collection));
    this._store.dispatch(new Copy({ item: null, collection: null }));
  }

  private _addItem(res) {
    if (!res) return false;
    this._store.dispatch(new AddItem(res));
  }

  private _addCollection(res) {
    if (!res) return false;
    const newCollection: VaultCollection = {
      id: res.id || null,
      name: res.name,
      icon: res.icon,
      created: null
    }

    this._store.dispatch(new AddCollection(newCollection));
  }

  private _initBackButton() {
    if (this._appService.isAndroid)
      this._page.on('BackButton', () => this.goUp(), this);
  }

  private _deinitBackButton() {
    if (this._appService.isAndroid)
      this._page.off('BackButton');
  }

  private _saveVault() {
    this._store.dispatch(new Save());
  }

  @HostListener('unloaded')
  pageDestroy() {
    this._deinitBackButton();
    this._subscriptions.forEach(x => x.unsubscribe());
  }

}
