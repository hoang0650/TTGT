import { animate, state, style, transition, trigger } from '@angular/animations';

export const slidingMapLayout = trigger('mapLayoutInfo', [
    state('open', style({
      position: 'absolute',
      left: '0%',
    })),
    state('closed', style({
      position: 'absolute',
      left: `{{curWidth}}`,
      }),
      {
        params: {
          curWidth: '-33%'
        }
      }
    ),
    transition('open => closed', [
      animate('0.3s')
    ]),
    transition('closed => open', [
      animate('0.3s')
    ]),
  ])

export const slidingMapLayoutButton = trigger('mapLayoutInfoButton', [
    state('open', style({
        position: 'absolute',
        left: `{{curWidth}}`,
      }),
      {
        params: {
          curWidth: '33%'
        }
      }
    ),
    state('closed', style({
      position: 'absolute',
      left: '0px',
    })),
    transition('open => closed', [
      animate('0.3s')
    ]),
    transition('closed => open', [
      animate('0.3s')
    ]),
  ])