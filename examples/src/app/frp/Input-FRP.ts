import {
      PointerEventStatus,
      PointerScreenEventData,
      startPointer,
      startTick,
      startTickPointer,
      TickEventData,
      TickPointerScreenEventData,
} from 'input-sender';
import { StreamSink } from 'sodiumjs';

export const input = {
  sStart: new StreamSink<PointerScreenEventData>(),
  sMove: new StreamSink<TickPointerScreenEventData>(),
  sEnd: new StreamSink<PointerScreenEventData>(),
  sTick: new StreamSink<TickEventData>()
}

const {sStart, sMove, sEnd, sTick} = input;

const domElement = document.getElementById("pointer");
const hasPointer = (window as any).PointerEvent ? true : false;

startPointer
      ({
          domElement,
          hasPointer,
          status: PointerEventStatus.START,
      })
      (({ data }) => sStart.send(data));

startTickPointer
      ({
          domElement,
          hasPointer,
          status: PointerEventStatus.MOVE,
      })
      (({ data }) => sMove.send(data));

startPointer
      ({
          domElement,
          hasPointer,
          status: PointerEventStatus.END,
      })
      (({ data }) => sEnd.send(data));

startTick
      ({})
      (({data}) => sTick.send(data));
