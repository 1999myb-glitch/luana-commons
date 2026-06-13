/** Shared font import + animation keyframes/utility classes for all Futari Quest pages. */
export const FQ_GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Yusei+Magic&family=Noto+Serif+JP:wght@900&display=swap');

@keyframes fq-pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1) } }
@keyframes fq-shake { 0%, 100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-6px) rotate(8deg) } }
@keyframes fq-sparkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1 } 50% { transform: scale(1.15) rotate(6deg); opacity: .85 } }
@keyframes fq-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
@keyframes fq-bounce-in { 0% { transform: scale(.4) translateY(30px); opacity: 0 } 70% { transform: scale(1.08) translateY(-4px); opacity: 1 } 100% { transform: scale(1) translateY(0) } }
@keyframes fq-glow { 0%, 100% { box-shadow: 0 0 0px rgba(242,160,196,0); } 50% { box-shadow: 0 0 24px rgba(242,160,196,.6); } }
@keyframes fq-rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }

.fq-pop { animation: fq-pop .4s ease-out; }
.fq-roll { display: inline-block; animation: fq-shake .25s ease-in-out infinite; }
.fq-sparkle { display: inline-block; animation: fq-sparkle 1.6s ease-in-out infinite; }
.fq-float { display: inline-block; animation: fq-float 2.4s ease-in-out infinite; }
.fq-bounce-in { animation: fq-bounce-in .5s cubic-bezier(.34,1.56,.64,1); }
.fq-glow { animation: fq-glow 1.8s ease-in-out infinite; }
.fq-super { display: inline-block; animation: fq-rainbow 2.5s linear infinite, fq-glow 1s ease-in-out infinite; }
.fq-input:focus { border-color: #F2A0C4; }
`
