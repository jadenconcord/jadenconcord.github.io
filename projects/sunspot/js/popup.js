var form = $('#contact-form');


function sucsess() {
  closePopup();
  $('.popup .submit').disabled = false;
  message('Message Sent');
}

function error() {
  $('.popup .email').classList.add('error');
  $('.popup .submit').disabled = false;
  message('Unknown Error');
}

function timeout() {
  $('.popup .submit').disabled = false;
  message('Error, No responce');
}

function closePopup(){
  $('.popup').style.display = 'none';
  $('html').style.overflowY = 'auto';
  $('html').style.overflowX = 'hidden';
}
function openPopup(){
  $('.popup').style.display = 'flex';
  $('html').style.overflow = 'hidden';
}

function message(text){
  $('.message').innerText = text;
  $('.message').style.display = 'block';
  $('.message').style.opacity = '1';

  setTimeout(() => {
    $('.message').style.opacity = '0';
    setTimeout(() => {
      $('.message').style.display = 'none';
    }, 500)
  }, 3000)
}

form.addEventListener("submit", function(ev) {
  $('.popup .submit').disabled = true;
  ev.preventDefault();
  var data = new FormData(form);
  ajax(form.method, form.action, data, sucsess, error, timeout);
});

function popupClick(a){
  if(a.target.className == 'popup'){
    closePopup();
  }
}
