
(function() {
  'use strict';
  window.addEventListener('load', function() {
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        console.log(form.checkValidity());
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });

  }, false);
})();

// Async deletion
var deleteItem = (el, url) => {
  var id = el.parentNode.querySelector('[name=id]').value,
  csrf = el.parentNode.querySelector('[name=_csrf]').value;
  var path = url + id;

if (!confirm('Are you sure you want to delete this?')) {
  return;  
}
  fetch( path, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
  .then(result => {
    return result.json();
  })
  .then(data => {
    el.parentNode.remove();
  })
  .catch(err => {
    console.log(err);
  })
  
 }
var deletePost = el => {
  deleteItem(el, '/posts/');
 }

var deleteUser = el => {
  deleteItem(el, '/user-delete/');
 }

 var deleteProduct = el => {
  deleteItem(el, '/product-delete/');
 }

 var deleteCart = el => {
  deleteItem(el, '/cart/');
 }

 var deleteOneOrder = el => {
   deleteItem(el, '/order/')
 }

 var deleteCat = el => {
  deleteItem(el, '/categories/')
}

 var clearOrders = el => {
  const csrf = el.parentNode.querySelector('[name=_csrf]').value;
  if (!confirm('Do you want to delete all the orders?')){
    return;
  }
  return fetch('/clear-orders', {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
  .then( () => {
    let main = el.parentNode.parentNode.querySelector('.order-item');
    while (main) {
      main.removeChild(main.lastChild);
    }
  })
  .catch(err => {
    console.log(err);
  });
}

//  Search
var highlight = function(val){
  $("#search-result li.match").each(function(){
    var matchStart = $(this).text().toLowerCase().indexOf(""+ val.toLowerCase() + "");

    var matchEnd = matchStart + val.length - 1;
    var beforeMatch = $(this).text().slice(0, matchStart);
    var matchText = $(this).text().slice(matchStart, matchEnd + 1);
    var afterMatch = $(this).text().slice(matchEnd + 1);
    $(this).html(`${beforeMatch}<em>${matchText}</em>${afterMatch}`);

  })
}

$("#search-result").on("click", "li", function(e){
  $("#search").val($(this).text())
})

$('#search-result').hide();

$('#search').on('keydown change', function(e){

  let val = e.target.value, query;
  if(!val) $('#search-result').hide();
  query = '?page=' + val;

  // Fetch the data from DB
  $.get('/search' + query)
    .done(function(data){
      console.log('DATA', data);
      $('#search-result').empty();
      if(!data.length){
        $('#search-result').append(`<li>No result found</li>`);
        $("#search-result").show();
      } else {
        
        data.forEach( item => {
          $('#search-result').append(`<li>${item.title}</li>`);
          $('#search-result li').removeClass("match").hide().filter(function(){
            return $(this).text().toLowerCase().indexOf($("#search").val().toLowerCase()) != 1;
          }).addClass("match").show();
     
        highlight(val);
        })
        $("#search-result").show();
      }
    })
})

// Select 2
$("#tree").select2({
  tags: true
});

$("#prod-tree").select2({
  maximumSelectionLength: 2,
  allowClear: true
});



