/* Loopinho: troca de poses, fala e pulo ao clicar */
(function(){
 var box=document.getElementById('mascote');if(!box)return;
 var img=box.querySelector('.m-main'),fala=document.getElementById('mascote-fala');
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 var poses=[
  {src:'img/loopinho.png',txt:'Oi! Eu sou o Loopinho 👍 Clique em mim!'},
  {src:'img/poseconsciente.png',txt:'Cada material ganha uma segunda chance 🌍'},
  {src:'img/posedeterminado.png',txt:'Separar é o primeiro passo!'},
  {src:'img/poseativo.png',txt:'Garrafa PET segue para reciclagem ♻'},
  {src:'img/poseamigavel.png',txt:'Vem fazer parte do ciclo!'}
 ];
 poses.forEach(function(p){(new Image()).src=p.src});
 var i=0,timer;
 function show(n){
  i=n%poses.length;
  box.classList.remove('pop','jump');void box.offsetWidth;
  img.src=poses[i].src;fala.textContent=poses[i].txt;
  box.classList.add('pop');
 }
 function auto(){clearInterval(timer);if(!reduce)timer=setInterval(function(){if(!document.hidden)show(i+1)},5000)}
 box.addEventListener('click',function(){
  show(i+1);auto();
  if(!reduce){box.classList.remove('pop');void box.offsetWidth;box.classList.add('jump')}
 });
 box.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();box.click()}});
 box.addEventListener('animationend',function(e){if(e.target===box)box.classList.remove('pop','jump')});
 auto();
})();