import { Component, Renderer, Input } from '@angular/core';

import {
  CoreService,
  MessageService,
  PaymentService
} from '../../../../services'
import { Competition } from '../../../../models'

@Component({
  selector: 'cp-ticket',
  templateUrl: 'cpTicket.html',
})
export class CompetitionTicket {
  globalListener:any;
  @Input() competition:Competition;
  site_settings: any;
  pay_with_stripe:boolean = false;

  constructor(private renderer: Renderer, private coreService: CoreService,
              private messageService: MessageService, private paymentService: PaymentService) {
  }

  ngOnInit() {
    this.site_settings = this.coreService.getAllSettings();
    this.payByPayPal();
    this.pay_with_stripe = this.site_settings['PAY_WITH_STRIPE']
  }

  initPayPal() {
    let competition = this.competition;
    let paymentService = this.paymentService;
    let messageService = this.messageService;
    let _ENV = '';
    if (this.site_settings['PAYPAL_SANDBOX']) {
      _ENV = 'sandbox';
    } else {
      _ENV = 'production';
    }
    let PAYPAL = (<any>window).paypal;
    PAYPAL.Button.render({
      env: _ENV, // Options: 'production' or 'sandbox'
      payment: function (resolve, reject) {
        PAYPAL.request.post(paymentService.payPalCreatePaymentUrl, {
          slug: competition.slug,
          title: competition.title,
        })
        .then(function (data) {
          if (!data.success) {
            messageService.errorMessage('An error has occurred. Please contact Administrator.');
          }
          resolve(data.token);
        })
        .catch(function (err) {
          messageService.errorMessage('An error has occurred. Please contact Administrator.');
          reject(err);
        });
      },
      onAuthorize: function (payment, actions) {
        // Note: you can display a confirmation page before executing
        PAYPAL.request.post(paymentService.payPalExecutePaymentUrl, {
          slug: competition.slug,
          title: competition.title,
          paymentToken: payment.paymentToken,
          payerID: payment.payerID
        })
        .then(function (data) {
          // Check if payment successful
          if (data.success) {
            competition.ticketed = true;
            messageService.infoMessage(data.message);
          } else {
            messageService.errorMessage(data.message);
          }
          // return actions.redirect();
        })
        .catch(function (err) {
          messageService.errorMessage('An error has occurred. Please contact Administrator.');
        });
      },
      onCancel: function (data, actions) {
        //return actions.redirect();
      }
    }, '#paypalButton');
  }

  initPayCard() {
    let competition = this.competition;
    let paymentService = this.paymentService;
    let messageService = this.messageService;
    let _KEY = this.site_settings['STRIPE_PUBLISHABLE_KEY'];
    let _AMOUNT = this.site_settings['STRIPE_TICKET_AMOUNT'];
    let STRIPE = (<any>window).StripeCheckout.configure({
      key: _KEY,
      locale: 'auto',
      // zipCode: true,
      // billingAddress: true,
      image: '/static/app/assets/img/stripe.png',
      token: function (token: any) {
        //Create Stripe payment
        paymentService.stripeCreatePayment(competition, token.id)
          .subscribe(
            response => {
              competition.ticketed = true;
              messageService.infoMessage(response['message']);
            },
            error => {
              messageService.errorMessage(error.body['message']);
            });
      },
      opened: function () {
        // console.log('Opened');
      },
      closed: function () {
        // console.log('Closed');
      }
    });

    STRIPE.open({
      name: 'Ticket',
      description: 'for ' + competition.title,
      amount: _AMOUNT
    });

    this.globalListener = this.renderer.listenGlobal('window', 'popstate', () => {
      STRIPE.close();
    });
  }

  payByPayPal() {
    let a = jQuery('#paypalButton');
    if(a.length){
      this.initPayPal();
    }else{
      setTimeout(() => {
        this.payByPayPal()
      }, 100);
    }
  }

  payByCard() {
    this.initPayCard();
  }

  ngOnDestroy() {
    if (typeof(this.globalListener) === 'function') {
      this.globalListener();
    }
  }
}

