/** Core */
import {Component} from '@angular/core';
/** Ionic */
import {NavParams, ViewController} from 'ionic-angular';
import {UIHelper} from '../../../services/uiHelper';

import {Mill} from '../../../classes/mill/mill';
import {IMill} from '../../../interfaces/mill/iMill';
import {UIMillStorage} from '../../../services/uiMillStorage';

/** Services */
@Component({
  templateUrl: 'mill-edit.html'
})
export class MillEditModal {

  public data: Mill = new Mill();

  private mill: IMill;

  constructor (private readonly navParams: NavParams,
               private readonly viewCtrl: ViewController,
               private readonly uiMillStorage: UIMillStorage,
               private readonly uiHelper: UIHelper) {

  }

  public ionViewWillEnter(): void {
    this.mill = this.navParams.get('MILL');
    this.data = this.uiHelper.copyData(this.mill);
  }

  public editMill(form): void {
    if (form.valid) {
      this.__editMill();
    }
  }

  public __editMill(): void {
    this.uiMillStorage.update(this.data);
    this.dismiss();
  }

  public dismiss(): void {
    this.viewCtrl.dismiss('', undefined, {animate: false});
  }

}
