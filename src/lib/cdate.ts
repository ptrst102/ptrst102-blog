import { cdate } from "cdate";

const cdateJST = cdate().tz("Asia/Tokyo").cdateFn();

export { cdateJST as cdate };
