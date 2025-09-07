"use strict";exports.id=8580,exports.ids=[8580],exports.modules={78580:(a,b,c)=>{c.r(b),c.d(b,{CheckmarkIcon:()=>R,ErrorIcon:()=>M,LoaderIcon:()=>O,ToastBar:()=>Z,ToastIcon:()=>W,Toaster:()=>aa,default:()=>ab,resolveValue:()=>s,toast:()=>G,useToaster:()=>I,useToasterStore:()=>E});var d,e=c(41060);let f={data:""},g=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,h=/\/\*[^]*?\*\/|  +/g,i=/\n+/g,j=(a,b)=>{let c="",d="",e="";for(let f in a){let g=a[f];"@"==f[0]?"i"==f[1]?c=f+" "+g+";":d+="f"==f[1]?j(g,f):f+"{"+j(g,"k"==f[1]?"":b)+"}":"object"==typeof g?d+=j(g,b?b.replace(/([^,])+/g,a=>f.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,b=>/&/.test(b)?b.replace(/&/g,a):a?a+" "+b:b)):f):null!=g&&(f=/^--/.test(f)?f:f.replace(/[A-Z]/g,"-$&").toLowerCase(),e+=j.p?j.p(f,g):f+":"+g+";")}return c+(b&&e?b+"{"+e+"}":e)+d},k={},l=a=>{if("object"==typeof a){let b="";for(let c in a)b+=c+l(a[c]);return b}return a};function m(a){let b,c,d,e=this||{},m=a.call?a(e.p):a;return((a,b,c,d,e)=>{var f,m,n,o;let p=l(a),q=k[p]||(k[p]=(a=>{let b=0,c=11;for(;b<a.length;)c=101*c+a.charCodeAt(b++)>>>0;return"go"+c})(p));if(!k[q]){let b=p!==a?a:(a=>{let b,c,d=[{}];for(;b=g.exec(a.replace(h,""));)b[4]?d.shift():b[3]?(c=b[3].replace(i," ").trim(),d.unshift(d[0][c]=d[0][c]||{})):d[0][b[1]]=b[2].replace(i," ").trim();return d[0]})(a);k[q]=j(e?{["@keyframes "+q]:b}:b,c?"":"."+q)}let r=c&&k.g?k.g:null;return c&&(k.g=k[q]),f=k[q],m=b,n=d,(o=r)?m.data=m.data.replace(o,f):-1===m.data.indexOf(f)&&(m.data=n?f+m.data:m.data+f),q})(m.unshift?m.raw?(b=[].slice.call(arguments,1),c=e.p,m.reduce((a,d,e)=>{let f=b[e];if(f&&f.call){let a=f(c),b=a&&a.props&&a.props.className||/^go/.test(a)&&a;f=b?"."+b:a&&"object"==typeof a?a.props?"":j(a,""):!1===a?"":a}return a+d+(null==f?"":f)},"")):m.reduce((a,b)=>Object.assign(a,b&&b.call?b(e.p):b),{}):m,(d=e.target,"object"==typeof window?((d?d.querySelector("#_goober"):window._goober)||Object.assign((d||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:d||f),e.g,e.o,e.k)}m.bind({g:1});let n,o,p,q=m.bind({k:1});function r(a,b){let c=this||{};return function(){let d=arguments;function e(f,g){let h=Object.assign({},f),i=h.className||e.className;c.p=Object.assign({theme:o&&o()},h),c.o=/ *go\d+/.test(i),h.className=m.apply(c,d)+(i?" "+i:""),b&&(h.ref=g);let j=a;return a[0]&&(j=h.as||a,delete h.as),p&&j[0]&&p(h),n(j,h)}return b?b(e):e}}var s=(a,b)=>"function"==typeof a?a(b):a,t=(()=>{let a=0;return()=>(++a).toString()})(),u=(()=>{let a;return()=>a})(),v="default",w=(a,b)=>{let{toastLimit:c}=a.settings;switch(b.type){case 0:return{...a,toasts:[b.toast,...a.toasts].slice(0,c)};case 1:return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case 2:let{toast:d}=b;return w(a,{type:+!!a.toasts.find(a=>a.id===d.id),toast:d});case 3:let{toastId:e}=b;return{...a,toasts:a.toasts.map(a=>a.id===e||void 0===e?{...a,dismissed:!0,visible:!1}:a)};case 4:return void 0===b.toastId?{...a,toasts:[]}:{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)};case 5:return{...a,pausedAt:b.time};case 6:let f=b.time-(a.pausedAt||0);return{...a,pausedAt:void 0,toasts:a.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+f}))}}},x=[],y={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},z={},A=(a,b=v)=>{z[b]=w(z[b]||y,a),x.forEach(([a,c])=>{a===b&&c(z[b])})},B=a=>Object.keys(z).forEach(b=>A(a,b)),C=(a=v)=>b=>{A(b,a)},D={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},E=(a={},b=v)=>{let[c,d]=(0,e.useState)(z[b]||y),f=(0,e.useRef)(z[b]);(0,e.useEffect)(()=>(f.current!==z[b]&&d(z[b]),x.push([b,d]),()=>{let a=x.findIndex(([a])=>a===b);a>-1&&x.splice(a,1)}),[b]);let g=c.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||D[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...c,toasts:g}},F=a=>(b,c)=>{let d,e=((a,b="blank",c)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:b,ariaProps:{role:"status","aria-live":"polite"},message:a,pauseDuration:0,...c,id:(null==c?void 0:c.id)||t()}))(b,a,c);return C(e.toasterId||(d=e.id,Object.keys(z).find(a=>z[a].toasts.some(a=>a.id===d))))({type:2,toast:e}),e.id},G=(a,b)=>F("blank")(a,b);G.error=F("error"),G.success=F("success"),G.loading=F("loading"),G.custom=F("custom"),G.dismiss=(a,b)=>{let c={type:3,toastId:a};b?C(b)(c):B(c)},G.dismissAll=a=>G.dismiss(void 0,a),G.remove=(a,b)=>{let c={type:4,toastId:a};b?C(b)(c):B(c)},G.removeAll=a=>G.remove(void 0,a),G.promise=(a,b,c)=>{let d=G.loading(b.loading,{...c,...null==c?void 0:c.loading});return"function"==typeof a&&(a=a()),a.then(a=>{let e=b.success?s(b.success,a):void 0;return e?G.success(e,{id:d,...c,...null==c?void 0:c.success}):G.dismiss(d),a}).catch(a=>{let e=b.error?s(b.error,a):void 0;e?G.error(e,{id:d,...c,...null==c?void 0:c.error}):G.dismiss(d)}),a};var H=1e3,I=(a,b="default")=>{let{toasts:c,pausedAt:d}=E(a,b),f=(0,e.useRef)(new Map).current,g=(0,e.useCallback)((a,b=H)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,e.useEffect)(()=>{if(d)return;let a=Date.now(),e=c.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&G.dismiss(c.id);return}return setTimeout(()=>G.dismiss(c.id,b),d)});return()=>{e.forEach(a=>a&&clearTimeout(a))}},[c,d,b]);let h=(0,e.useCallback)(C(b),[b]),i=(0,e.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,e.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,e.useCallback)(()=>{d&&h({type:6,time:Date.now()})},[d,h]),l=(0,e.useCallback)((a,b)=>{let{reverseOrder:d=!1,gutter:e=8,defaultPosition:f}=b||{},g=c.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...d?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[c]);return(0,e.useEffect)(()=>{c.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[c,g]),{toasts:c,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}},J=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,K=q`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,L=q`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,M=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${J} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${K} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${a=>a.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${L} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,N=q`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,O=r("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${a=>a.secondary||"#e0e0e0"};
  border-right-color: ${a=>a.primary||"#616161"};
  animation: ${N} 1s linear infinite;
`,P=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Q=q`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,R=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${P} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Q} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${a=>a.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,S=r("div")`
  position: absolute;
`,T=r("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,U=q`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,V=r("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${U} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,W=({toast:a})=>{let{icon:b,type:c,iconTheme:d}=a;return void 0!==b?"string"==typeof b?e.createElement(V,null,b):b:"blank"===c?null:e.createElement(T,null,e.createElement(O,{...d}),"loading"!==c&&e.createElement(S,null,"error"===c?e.createElement(M,{...d}):e.createElement(R,{...d})))},X=r("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Y=r("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Z=e.memo(({toast:a,position:b,style:c,children:d})=>{let f=a.height?((a,b)=>{let c=a.includes("top")?1:-1,[d,e]=u()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*c}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*c}%,-1px) scale(.6); opacity:0;}
`];return{animation:b?`${q(d)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${q(e)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(a.position||b||"top-center",a.visible):{opacity:0},g=e.createElement(W,{toast:a}),h=e.createElement(Y,{...a.ariaProps},s(a.message,a));return e.createElement(X,{className:a.className,style:{...f,...c,...a.style}},"function"==typeof d?d({icon:g,message:h}):e.createElement(e.Fragment,null,g,h))});d=e.createElement,j.p=void 0,n=d,o=void 0,p=void 0;var $=({id:a,className:b,style:c,onHeightUpdate:d,children:f})=>{let g=e.useCallback(b=>{if(b){let c=()=>{d(a,b.getBoundingClientRect().height)};c(),new MutationObserver(c).observe(b,{subtree:!0,childList:!0,characterData:!0})}},[a,d]);return e.createElement("div",{ref:g,className:b,style:c},f)},_=m`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,aa=({reverseOrder:a,position:b="top-center",toastOptions:c,gutter:d,children:f,toasterId:g,containerStyle:h,containerClassName:i})=>{let{toasts:j,handlers:k}=I(c,g);return e.createElement("div",{"data-rht-toaster":g||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...h},className:i,onMouseEnter:k.startPause,onMouseLeave:k.endPause},j.map(c=>{let g=c.position||b,h=((a,b)=>{let c=a.includes("top"),d=a.includes("center")?{justifyContent:"center"}:a.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:u()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${b*(c?1:-1)}px)`,...c?{top:0}:{bottom:0},...d}})(g,k.calculateOffset(c,{reverseOrder:a,gutter:d,defaultPosition:b}));return e.createElement($,{id:c.id,key:c.id,onHeightUpdate:k.updateHeight,className:c.visible?_:"",style:h},"custom"===c.type?s(c.message,c):f?f(c):e.createElement(Z,{toast:c,position:g}))}))},ab=G}};