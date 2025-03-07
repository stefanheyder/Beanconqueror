/** Core */
import {Component, ViewChild} from '@angular/core';
/** Ionic */
import {Slides, ViewController} from 'ionic-angular';
/** Services */
/** Components */
import {TimerComponent} from '../../../components/timer/timer';
import {UIBeanStorage} from '../../../services/uiBeanStorage';
import {UIBrewStorage} from '../../../services/uiBrewStorage';
import {UIHelper} from '../../../services/uiHelper';
import {UIImage} from '../../../services/uiImage';
import {UIPreparationStorage} from '../../../services/uiPreparationStorage';
import {UISettingsStorage} from '../../../services/uiSettingsStorage';
/** Enums */
import {BREW_VIEW_ENUM} from '../../../enums/settings/brewView';
/** Classes */
import {Brew} from '../../../classes/brew/brew';
/** Interfaces */
import {IBean} from '../../../interfaces/bean/iBean';
import {IPreparation} from '../../../interfaces/preparation/iPreparation';
import {ISettings} from '../../../interfaces/settings/iSettings';
import {BREW_QUANTITY_TYPES_ENUM} from '../../../enums/brews/brewQuantityTypes';
import {IMill} from '../../../interfaces/mill/iMill';
import {UIMillStorage} from '../../../services/uiMillStorage';

/** Enums */

@Component({
  selector: 'brews-add',
  templateUrl: 'brews-add.html'
})
export class BrewsAddModal {
  @ViewChild('photoSlides') public photoSlides: Slides;
  @ViewChild('timer') public timer: TimerComponent;
  @ViewChild('brewTemperatureTime') public brewTemperatureTime: TimerComponent;

  public data: Brew = new Brew();

  public BREW_VIEW_ENUM = BREW_VIEW_ENUM;
  public settings: ISettings;

  public brewQuantityTypeEnums = BREW_QUANTITY_TYPES_ENUM;

  public method_of_preparations: Array<IPreparation> = [];
  public beans: Array<IBean> = [];
  public mills: Array<IMill> = [];

  public keyDownHandler(event: Event): void {

    //  event.preventDefault();
  }

  constructor (private readonly viewCtrl: ViewController,
               private readonly uiBeanStorage: UIBeanStorage,
               private readonly uiPreparationStorage: UIPreparationStorage,
               private readonly uiBrewStorage: UIBrewStorage,
               private readonly uiImage: UIImage,
               private readonly uiSettingsStorage: UISettingsStorage,
               public uiHelper: UIHelper,
               private readonly uiMillStorage: UIMillStorage) {
    // Initialize to standard in drop down

    this.settings = this.uiSettingsStorage.getSettings();
    this.method_of_preparations = this.uiPreparationStorage.getAllEntries()
      .sort((a, b) => a.name.localeCompare(b.name));
    this.beans = this.uiBeanStorage.getAllEntries()
      .filter((bean) => !bean.finished)
      .sort((a, b) => a.name.localeCompare(b.name));
    this.mills = this.uiMillStorage.getAllEntries()
      .sort((a, b) => a.name.localeCompare(b.name));

    // Get first entry
    this.data.bean = this.beans[0].config.uuid;
    this.data.method_of_preparation = this.method_of_preparations[0].config.uuid;
    this.data.mill = this.mills[0].config.uuid;

  }

  public ionViewDidEnter(): void {
    this.__loadLastBrew();
  }

  public dismiss(): void {
    this.viewCtrl.dismiss('', undefined, {animate: false});
  }

  public finish(): void {

    this.stopTimer();
    this.uiBrewStorage.add(this.data);
    this.dismiss();
  }

  public brewTimeStarted(_event): void {
    if (this.brewTemperatureTime) {
      this.brewTemperatureTime.pauseTimer();
    }
  }

  public getTime(): number {
    if (this.timer) {
      return this.timer.getSeconds();
    }

    return 0;
  }

  public setCoffeeDripTime(): void {
    this.data.coffee_first_drip_time = this.getTime();
  }

  public setCoffeeBloomingTime(): void {
    this.data.coffee_blooming_time = this.getTime();
  }

  public addImage(): void {
    this.uiImage.showOptionChooser()
      .then((_option) => {
      if (_option === 'CHOOSE') {
        // CHOSE
        this.uiImage.choosePhoto()
          .then((_path) => {
          console.log(_path);

          if (_path) {
            this.data.attachments.push(_path.toString());
          }

        });
      } else {
        // TAKE
        this.uiImage.takePhoto()
          .then((_path) => {
          this.data.attachments.push(_path.toString());
        });
      }
    });
  }

  public deleteImage(_index: number): void {
    this.data.attachments.splice(_index, 1);
    if (this.data.attachments.length > 0) {
      // Slide to one item before
      this.photoSlides.slideTo(_index - 1, 0);
    }

  }

  public stopTimer(): void {
    if (this.brewTemperatureTime) {
      this.brewTemperatureTime.pauseTimer();
      this.data.brew_temperature_time = this.brewTemperatureTime.getSeconds();
    } else {
      this.data.brew_temperature_time = 0;
    }
    if (this.timer) {
      this.timer.pauseTimer();
      this.data.brew_time = this.timer.getSeconds();
    } else {
      this.data.brew_time = 0;
    }

  }

  // tslint:disable-next-line
  private __loadLastBrew(): void {
    if (this.settings.set_last_coffee_brew) {
      const brews: Array<Brew> = this.uiBrewStorage.getAllEntries();
      if (brews.length > 0) {
        const lastBrew: Brew = brews[brews.length - 1];

        if (this.settings.default_last_coffee_parameters.bean_type) {
          const lastBrewBean: IBean = this.uiBeanStorage.getByUUID(lastBrew.bean);
          if (!lastBrewBean.finished) {
            this.data.bean = lastBrewBean.config.uuid;
          }

        }

        if (this.settings.default_last_coffee_parameters.grind_size) {
          this.data.grind_size = lastBrew.grind_size;
        }
        if (this.settings.default_last_coffee_parameters.grind_weight) {
          this.data.grind_weight = lastBrew.grind_weight;
        }
        if (this.settings.default_last_coffee_parameters.method_of_preparation) {
          this.data.method_of_preparation = lastBrew.method_of_preparation;
        }
        if (this.settings.default_last_coffee_parameters.mill) {
          this.data.mill = lastBrew.mill;
        }
        if (this.settings.default_last_coffee_parameters.mill_speed) {
          this.data.mill_speed = lastBrew.mill_speed;
        }
        if (this.settings.default_last_coffee_parameters.pressure_profile) {
          this.data.pressure_profile = lastBrew.pressure_profile;
        }
        if (this.settings.default_last_coffee_parameters.brew_temperature) {
          this.data.brew_temperature = lastBrew.brew_temperature;
        }

        if (this.brewTemperatureTime) {
          if (this.settings.default_last_coffee_parameters.brew_temperature_time) {
            this.data.brew_temperature_time = lastBrew.brew_temperature_time;
            this.brewTemperatureTime.setTime(this.data.brew_temperature_time);
          }
        }
        if (this.timer) {
          if (this.settings.default_last_coffee_parameters.brew_time) {
            this.data.brew_time = lastBrew.brew_time;
            this.timer.setTime(this.data.brew_time);
          }
        }

        if (this.settings.default_last_coffee_parameters.brew_quantity) {
          this.data.brew_quantity = lastBrew.brew_quantity;
          this.data.brew_quantity_type = lastBrew.brew_quantity_type;
        }
        if (this.settings.default_last_coffee_parameters.coffee_type) {
          this.data.coffee_type = lastBrew.coffee_type;
        }
        if (this.settings.default_last_coffee_parameters.coffee_concentration) {
          this.data.coffee_concentration = lastBrew.coffee_concentration;
        }
        if (this.settings.default_last_coffee_parameters.coffee_first_drip_time) {
          this.data.coffee_first_drip_time = lastBrew.coffee_first_drip_time;
        }
        if (this.settings.default_last_coffee_parameters.coffee_blooming_time) {
          this.data.coffee_blooming_time = lastBrew.coffee_blooming_time;
        }

        if (this.settings.default_last_coffee_parameters.rating) {
          this.data.rating = lastBrew.rating;
        }
        if (this.settings.default_last_coffee_parameters.note) {
          this.data.note = lastBrew.note;
        }

      }
    }
  }

}
