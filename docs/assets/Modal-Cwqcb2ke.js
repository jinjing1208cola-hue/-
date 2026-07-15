import{c as d,r as c,j as e}from"./index-DXXUG3pc.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=d("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=d("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);function y({open:t,onClose:a,title:l,children:n,width:i=560}){const r=c.useRef(null);return c.useEffect(()=>{if(!t)return;const s=o=>{o.key==="Escape"&&a()};return document.addEventListener("keydown",s),()=>document.removeEventListener("keydown",s)},[t,a]),t?e.jsx("div",{className:"modal-overlay",ref:r,onClick:s=>{s.target===r.current&&a()},children:e.jsxs("div",{className:"modal-panel",style:{maxWidth:i},children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("span",{className:"modal-title",children:l}),e.jsx("button",{className:"modal-close",onClick:a,children:"✕"})]}),e.jsx("div",{className:"modal-body",children:n})]})}):null}export{y as M,h as P,u as T};
