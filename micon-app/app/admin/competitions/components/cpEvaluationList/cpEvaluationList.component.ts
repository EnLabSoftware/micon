import { Component, Input } from '@angular/core';

import { ConfirmationService } from 'primeng/primeng';

import { MessageService, EvaluationService } from '../../../../services'
import { Competition, Evaluation } from '../../../../models'

@Component({
  selector: 'cp-evaluation-list',
  styles: [require('./cpEvaluationList.scss')],
  template: require('./cpEvaluationList.html')
})
export class EvaluationList {
  dataList: Evaluation[];
  evaluation: Evaluation = new Evaluation();
  editRow: Evaluation;
  @Input() competition:Competition;

  errorMessages: any[];
  is_create = false;
  is_edit = false;
  formSettings = {
    header: 'Evaluation Code',
    visible: false,
    appendTo: 'body',
    modal: true,
    draggable: false,
    resizable: false,
    responsive: true,
    width: 500
  };

  constructor(private evaluationService: EvaluationService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.evaluationService.getEvaluations(this.competition.slug).subscribe((data) => {
      this.dataList = data;
    }, (errors) => {
      this.messageService.errorMessage('An error has occurred');
      // console.log(errors);
    });
  }

  showDialog() {
    this.formSettings.visible = true;
  }

  hideDialog() {
    this.formSettings.visible = false;
    this.evaluation = new Evaluation();
    this.editRow = new Evaluation();
  }

  formCreate(isValid: boolean) {
    if (isValid) {
      this.evaluationService.createEvaluation(this.competition.slug, this.evaluation).subscribe(
        (data) => {
          this.messageService.infoMessage('Evaluation created successfully');
          this.loadData();
          this.hideDialog();
        }, (errors) => {
          this.messageService.errorMessage('An error has occurred');
          this.hideDialog();
          // console.log(errors);
        });
    }
  }

  formEdit(isValid: boolean): void {
    if (isValid) {
      this.evaluationService.updateEvaluation(this.competition.slug, this.editRow).subscribe(
        (data) => {
          this.messageService.infoMessage('Evaluation updated successfully');
          this.hideDialog();
        },
        (errors) => {
          this.messageService.errorMessage('An error has occurred');
          this.hideDialog();
          // console.log(errors);
        });
    }
  }

  onCreate() {
    this.is_create = true;
    this.is_edit = false;
    this.showDialog();
  }

  onEdit(data: Evaluation) {
    this.is_edit = true;
    this.is_create = false;
    this.editRow = data;
    this.showDialog();
  }

  onDelete(datafile: Evaluation): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      header: 'Delete Confirmation',
      icon: 'fa fa-trash',
      accept: () => {
        this.evaluationService.deleteEvaluation(this.competition.slug, datafile.id).subscribe((data) => {
            this.messageService.infoMessage('Evaluation deleted successfully');
            this.dataList.splice(this.dataList.indexOf(datafile), 1);
          }, (errors) => {
            this.messageService.errorMessage('An error has occurred');
            // console.log(errors);
          });
      }
    });
  }

}
