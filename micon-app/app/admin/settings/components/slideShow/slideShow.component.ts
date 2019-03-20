import { Component } from '@angular/core';
import { SlideSetting } from '../../../../models'
import { CoreService, MessageService } from '../../../../services'

@Component({
  selector: 'sliders-list',
  styles: [require('./slideShow.scss')],
  template: require('./slideShow.html')
})
export class SlideShow {
  public slide_setting = new SlideSetting();
  public defaultImage = '/static/images/no-image.png';
  dataList: SlideSetting[];
  display: boolean = false;

  constructor(private coreService: CoreService, private messageService: MessageService ) {}

  ngOnInit(){
    this.loadData();
  }

  loadData(){
    this.coreService.getFrontSettings().subscribe(
      (data) => {
        this.dataList = data['slides_setting'];
      },
      (error) => {
        console.log(error)
      }
    )
  }

  showDialog() {
    this.slide_setting = {};
    this.display = true;
  }

  onDelete(data: SlideSetting): void {
    this.coreService.delete_slide(data).subscribe(
      (data) => {
        if (data['success']) {
          this.messageService.infoMessage('Delete slide successful.')
        } else {
          this.messageService.errorMessage('An error has occur. Please try again or contact administrator.')
        }
        this.loadData()
      },
      (errors) => {
        console.log(errors)
      }
    )
  }

  onEdit(data: SlideSetting): void {
    this.slide_setting = data;
    this.display = true;
  }

  formSubmit(isValid: boolean) {
    if (isValid) {
      this.coreService.add_new_slide(this.slide_setting).subscribe(
      (data) => {
        if (data['success']) {
          this.messageService.infoMessage('Add new slide successful.')
        } else {
          this.messageService.errorMessage('An error has occur. Please try again or contact administrator.')
        }
        this.loadData();
        this.display = false;
      },
      (errors) => {
        console.log(errors)
      }
    )}
  }
}
