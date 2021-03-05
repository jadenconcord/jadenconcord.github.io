var prescroll = 0;


$('body').onscroll = (e) => {

}

setInterval(() => {
  var scroll = $('html').scrollTop
  prescroll = (prescroll*9+scroll)/10
  var diff = Math.abs(scroll-prescroll)
  if(diff>500){
    prescroll = (prescroll*(diff/100-1)+scroll)/(diff/100)
  }



  for(var i = 1; i < 11; i++){
    // $$('.pr'+i).styles({
    //   transform: `translateY(${change}px)`,
    // })
    for(var b in $$('.pr'+i)){
      if($$('.pr'+i)[b].style != undefined){
        var offset = prescroll-$$('.pr'+i)[b].offsetTop+(screen.height/2)
        var change = (5-i)*((  offset )/5)
        $$('.pr'+i)[b].style.transform = `translateY(${change}px)`

      }
    }

    for(var b in $$('.prp'+i)){
      if($$('.prp'+i)[b].style != undefined){
        var offset = $$('.prp'+i)[b].offsetParent && prescroll-$$('.prp'+i)[b].offsetParent.offsetTop+(screen.height/2)
        var change = (5-i)*((  offset )/10)
        $$('.prp'+i)[b].style.transform = `translateY(${change}px)`

      }
    }

  }
}, 20)


$('.down-arrow-image').onclick = () => {
  window.scrollTo(0, $('.wwa').offsetTop);
}


document.onscroll = (e) => {
  if((window.innerHeight+window.scrollY+1) >= document.body.offsetHeight){
    $('footer').classList = ['up']
  }
  else{
    $('footer').classList = ['down']
  }
}
