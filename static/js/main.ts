import "../css/main.css";
import { init } from "./barba";

/** CONSTANTS */
const website: any = {};

/**
 * LOG SALUTATION
 * @param {object} publics
 */
(function Log(publics) {
  publics.init = function () {
    console.log(`
 ______     __   __     ______     ______   ______    
/\\  ___\\   /\\ "-.\\ \\   /\\  __ \\   /\\  == \\ /\\  ___\\   
\\ \\ \\__ \\  \\ \\ \\-.  \\  \\ \\ \\/\\ \\  \\ \\  _-/ \\ \\___  \\  
 \\ \\_____\\  \\ \\_\\ "\\_\\  \\ \\_____\\  \\ \\_\\    \\/\\_____\\ 
  \\/_____/   \\/_/ \\/_/   \\/_____/   \\/_/     \\/_____/                                                       
`);

    console.log(`If you're seeking the perfect adventure, check out our careers page at https://gno.land`);
    init();
  };
})(website);

(function () {
  website.init();
})();
