function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}


$(document).ready(function(){
    // var endpoint = 'http://127.0.0.1:8000/api/comments/'
    var dataUrl = $(".calvo-load-comments").attr("data-url")
    var endpoint = $(".calvo-load-comments").attr("data-api-endpoint") || "/api/comments/"
    var loginUrl = $(".calvo-load-comments").attr("data-login") || '/accounts/login/'
    console.log(endpoint)
    var isUser = false;
    var authUsername;
    $(".calvo-load-comments").after("<div class='load-container'</div>")
   
    getComments(dataUrl)
    

    function renderCommentLine(object)
    {
        var authorImage = '<div class="media-left">' +
      '<img class="calvo-user-image media-object" src="' + object.image + '" alt="..."></div>'


        var author = "";
        if (object.user){
            author =  "<small> via " + object.user.username + "</small>"

           
         

        }
        var timestamp = new Date(object.timestamp).toLocaleString()
        
        var htmlStart = "<div class='media cavlo-media'>" + authorImage +"<div class='media-body'>" +
       "<p class='cfe-media-content' data-id='" + object.id +"'>" +  object.content + "</p>" + author 
         + "<small> on" 
         + 
            timestamp 
          

          if (object.user){
          if (object.user.username == authUsername){
            htmlStart = htmlStart + ' | <a href="#" class="cfe-media-edit">Edit</a>'
          } 
        }
        var html_ = htmlStart + "</small></div></div>"
        return html_
    }


    function getComments(requestUrl){
      //  console.log(getCookie('isUser'))
       isUser = $.parseJSON(getCookie('isUser'));
       authUsername = String(getCookie('authUsername'));
      
       
        $(".calvo-load-comments").html('<h3>Comments</h3>')

        $.ajax({
            method: "GET",
            url:endpoint,
            data: {
                url:requestUrl,
            },
            success: function(data){
                if(data.length > 0)
                {
                  
                $.each(data, function(index, object){
                    $(".calvo-load-comments").append(renderCommentLine(object))
                    })

                }

               var formHtml = generateForm()
               $(".load-container").html(formHtml)
            

               
                
            },
            error: function(data){
                console.log('error')
                console.log(data)
        
            }
            })

    }

    function generateForm()
    {
      var html_ = "<form method='POST' class='comment-form'>" +
      "<textarea class='form-control' placeholder='Your comment...' name='content'></textarea><br/>" + 
      "<input class='btn btn-default' type='submit' value='Comment'></form>"
    if (isUser){
        return html_
    } else {
      html_ = '<div class="text-center" style="padding:20px"><a href="' + loginUrl + '">Login</a> Required to Comment</div>'
      return html_
    }
  }
    function formatErrorMsg(jsonResponse)
    {
        var message = ""
        $.each(jsonResponse, function(key, value){
          if (key == 'detail'){
            message += value + "<br/>"
          } else {
            message += key + ": " + value + "<br/>"
          }
          
        })

        var formattedMsg = '<div class="calvine-alert-error alert alert-danger alert-dismissible">'+
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        message +
        "</div>"
        return formattedMsg
    }

    function handleForm(formData){
        
       $.ajax({
            method: "POST",
            url:endpoint + "create/",
            
            data: formData + "&url=" + dataUrl,
            success: function(data){
                console.log(data)
                // getComments(dataUrl)
                $(".calvo-load-comments").append(renderCommentLine(data))
                var formHtml = generateForm()
                $(".load-container").html(formHtml)
            },
            error: function(data){
                console.log('error')
                console.log(data.responseJSON)
                var formErrorExists = $('.calvine-alert-error')
                if (formErrorExists.length > 0){
                  formErrorExists.remove()
                }
                var msg =  formatErrorMsg(data.responseJSON)
                $(".comment-form textarea").before(msg)

            }
        })

    }

   $(document).on('submit','.comment-form',function(e){
        e.preventDefault()
        var formData = $(this).serialize()
        handleForm(formData)
        // console.log(formData)
        
       
    })

    //CALVO inline reply edit
  $(document).on('click', '.cfe-media-edit', function(e){
    e.preventDefault()

    $(this).fadeOut()
    var contentHolder = $(this).parent().parent().find(".cfe-media-content")
    var contentTxt = contentHolder.text()
    var objectId = contentHolder.attr('data-id')
    $(this).after(generateEditForm(contentTxt, objectId))

    


  })
  
  $(document).on('submit','.comment-edit-form',function(e){
    e.preventDefault()
    var formData = $(this).serialize()
    var objectId = $(this).attr("data-id")
    handleEditForm(formData,objectId)
    // console.log(formData)
    
   
})

  function generateEditForm(content,objectId)
  {
    var html_ = "<hr /><form method='POST' class='comment-edit-form' data-id='" + objectId + "'>" +
    "<textarea class='form-control' placeholder='Your comment...' name='content'>" + content +"</textarea><br/>" + 
    "<input class='btn btn-success' type='submit' value='Save Edit'>" +
  
    "<button class='btn btn-primary comment-cancel'>Cancel</button>"+
    "<button class='btn btn-danger comment-delete'>Delete</button>"
    "</form><br />"

    return html_
  
}
$(document).on('click', '.comment-edit-cancel', function(e){
  $(this).parent().parent().find('.cfe-media-edit').fadeIn();
  $(this).parent().remove()


})

$(document).on('click', '.comment-delete', function(e){
  e.preventDefault()
  var dataId = $(this).parent().attr('data-id')
  $.ajax({
    method:"DELETE",
    url: endpoint + dataId + "/",
    success: function(){
      getComments(dataUrl)
    }
  })
})

  function handleEditForm(formData, objectId){
        
    $.ajax({
         method: "PUT",
         url:endpoint + objectId + "/",
         
         data: formData ,
         success: function(data){
             
             getComments(dataUrl)
          
         },
         error: function(data){
             console.log('error')
             console.log(data.responseJSON)
           
             var msg =  formatErrorMsg(data.responseJSON)
             $("[data-id='" + objectId +"'] textarea").before(msg)

         }
     })

 }

    

  })
