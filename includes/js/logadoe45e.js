var avisoAva = true;
$(function () {
 
    var login = new Login();
    var sessao = login.getSessao();

    if (sessao == null || !sessao.Valido)
        window.location = '/presencial/';
   
    preencheinfos(sessao);

    
    if(sessao.PopUpAviso == true){ 
        $('#modalPai').modal({show: true}); 
    }
    
    avisoAva = sessao.PopUpVideo;

    // Ao marcar o checkbox de avisos gerais.
    $('.checkmark').on('click', function(){  
        
        var urlAviso = '/usuarios/naovisualizaravisopresencial/';

        if($(this).hasClass('ava')){
            urlAviso = '/usuarios/naovisualizarvideopresencial/';
        }
        // usuarios/naovisualizaraviso/{id}
        $.ajax({            
            type: "POST",
            global:false,
            url: api + urlAviso + sessao.Matricula,
            success: function (json){          
                window.localStorage.setItem("dados", JSON.stringify(json));
                window.sessionStorage.setItem("dados", JSON.stringify(json));
            },
            error: $.noop
        });
    });

});

function acesso(id){
    avisoAva = false;
    var sistema = $.grep((JSON.parse(sessionStorage.getItem('dados') || "{}")).Sistemas || [], function(a) { return a.Id == id });
    if(sistema.length == 0) return;
    (sistema[0].NovaJanela) ? window.open(sistema[0].Url) : window.location = sistema[0].Url;
}

function preencheinfos(sessao) {

    var icones = {
        "id-145": "fa fa-globe",   // AVA
        "id-138": "fa-book",       // Disciplina On-Line
        "id-142": "fa-user",       // secretaria
        "id-144": "fa-file-text-o" // Trabalhos academicos
    };

    if (sessao.Sistemas == null || sessao.Sistemas.length <= 0)
        return false;
  
    var _idx = 1;
    $(sessao.Sistemas).each(function (idx, sistema) {

        var icone = icones['id-' + sistema.Id] || 'fa-exclamation-circle', click = CriaClick(sistema);

        var $sistema = $(
            '<div class="col-xs-6 col-sm-6 col-md-3 col-lg-3 box-'+_idx+' cont-box">' +
            '   <h2><i class="fa ' + icone + '"></i><br />' +
            '       <a href="#" class="sistema">' + sistema.Descricao + '</a>' +
            '   </h2>' +
            '</div>'
        ).click(click);


        $menu = $(
            '<li><a title="'+sistema.Descricao+'" class="sistema" href="#">'+sistema.Descricao+'</a></li>'
        ).click(click);

        $('.area-botoes-sistema').append($sistema);
        $('.area-menu-sistema').append($menu);

        _idx = (_idx == 4) ? 1 : _idx + 1;
       
    });

    $('.nome-logado').text(sessao.Nome);
    
}

function CriaClick(sistema) {

    var query = {}, action = sistema.Url.replace(/(.+)\?.+/gi, "$1"), target = (sistema.NovaJanela) ? "_blank" : "frameLogin";
    try {
        $(sistema.Url.toLowerCase().replace(/.+\/\?(.+)/gi, "$1").split('&')).each(function (idx, vl) {
            query[vl.split('=')[0]] = vl.split('=')[1];
        });
    } catch (ex) { }

    var click = function (e) {

        if ((/.+\/centralsistemaservico\/acesso\/.+/gi).test(sistema.Url) && sistema.NovaJanela == true) {
            e.preventDefault();
            var $form = $(
                '<form id="form-acesso" method="post" action="' + action + '" target="' + target + '">' +
                '   <input type="hidden" name="token" value="' + query.token + '" />' +
                '   <input type="hidden" name="sistema" value="' + query.sistema + '" />' +
                '</form>'
            );

            if(avisoAva && sistema.Id == 145){
                
                $('#modalava').modal({open: true});
            } else{
                $('body').append($form);
                $form.submit();
            }
            
        }
        else if (sistema.NovaJanela == false) {
            e.preventDefault();
            window.localStorage.setItem("Sistema", JSON.stringify({ url: sistema.Url, descricao: sistema.Descricao }));
            window.location = "Interna.aspx";
        }
        else {
            window.open(sistema.Url);
        }
    }
    return click;
}

// modal avisos
// Controle do video de novidades geral.
var myPlayer = amp('vid1', { /* Options */
    techOrder: ["azureHtml5JS", "flashSS", "html5FairPlayHLS", "silverlightSS", "html5"],
    nativeControlsForTouch: false,
    width: "100%",                
    controls: true,
    autoplay: false,
    logo: { "enabled": false }		
});

var myPlayerAVA = amp('vid2', { /* Options */
    techOrder: ["azureHtml5JS", "flashSS", "html5FairPlayHLS", "silverlightSS", "html5"],
    nativeControlsForTouch: false,
    width: "100%",                
    controls: true,
    autoplay: false,
    logo: { "enabled": false }		
  }
); 
/*
var myPlayerAVA2 = amp('vid3', { 
    techOrder: ["azureHtml5JS", "flashSS", "html5FairPlayHLS", "silverlightSS", "html5"],
    nativeControlsForTouch: false,
    width: "100%",                
    controls: true,
    autoplay: false,
    logo: { "enabled": false }		
  }
); 
*/
myPlayer.src([{
    src: "https://unip.streaming.mediaservices.windows.net/6ea4e05f-09bd-4a4b-a2f5-4502567af5f3/180207_AreaDoAluno_2018_Presenci.ism/manifest",
    type: "application/vnd.ms-sstr+xml"
}]);

myPlayerAVA.src([{
    src: "https://unip.streaming.mediaservices.windows.net/c9aafbd2-8c8b-454c-aad7-6dc1fcf7c00c/180216_NovoLayout_AVA_Presencial.ism/manifest",
    type: "application/vnd.ms-sstr+xml"
}]);

/*
myPlayerAVA2.src([{
    src: "https://unip.streaming.mediaservices.windows.net/c9aafbd2-8c8b-454c-aad7-6dc1fcf7c00c/180216_NovoLayout_AVA_Presencial.ism/manifest",
    type: "application/vnd.ms-sstr+xml"
}]);
*/
// Notificações após Login.
// Ao fechar a modal, pausa o video.
$("#modalcaranova").on('hide.bs.modal', function(e){     
    //e.preventDefault();
    myPlayer.pause();
    $( ".aparece" ).text("ASSISTIR VIDEO");
});   

// Ao abrir a modal, coloca o video no inicio.
$("#modalcaranova").on('show.bs.modal', function(e){
    myPlayer.currentTime(0);
});

// Notificações ao clicar no AVA.
$("#modalava").on('hide.bs.modal', function(e){
    // e.preventDefault();    
    myPlayerAVA.pause();
    //myPlayerAVA2.pause();
    $( ".apareceAVA, .apareceAVA2" ).text("ASSISTIR VÍDEO");
 });  

 $("#modalava").on('show.bs.modal', function(e){    
    $("#modalava").find('.video-container').hide();
    //myPlayerAVA.currentTime(0);
 });
 

// Ao clicar em fechar a modal de dentro, verifica qual modal foi clicada para fazer um FadeOUT.
$('.close').on('click', function(){ 
   myPlayer.pause();
   var id = $(this).attr('ref');
   $('#' + id).fadeOut(300);
});

$(document).ready(function(){ 
  if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)){
    myPlayer.pause();    
    myPlayerAVA.pause();
    //myPlayerAVA2.pause();
  }


   var video = document.getElementById("videoCaraNova");
   $('.video-container').hide();

   $( ".aparece" ).click(function(event) {
       event.preventDefault();
       if($(this).text() == "FECHAR O VÍDEO")
       {
           $(this).text("ASSISTIR AO VIDEO");     
           myPlayer.pause();
       } else {
           $(this).text("FECHAR O VÍDEO");                            
           myPlayer.play();
       }
       $('.video-container').animate({
           height: "toggle"
       }, 500);
   });

    $( ".apareceAVA" ).click(function(event) {
        event.preventDefault();
        if($(this).text() == "FECHAR O VÍDEO")
        {
            $(this).text("ASSISTIR AO VIDEO");     
            myPlayerAVA.pause();
        } else {
            $(this).text("FECHAR O VÍDEO");                            
            myPlayerAVA.play();
        }
        $('.video-container', $(this).parent().parent().parent()).animate({
            height: "toggle"
        }, 500);
    });   
    
    /*
    $( ".apareceAVA2" ).click(function(event) {
        event.preventDefault();
        if($(this).text() == "FECHAR O VÍDEO")
        {
            $(this).text("ASSISTIR AO VIDEO");     
            myPlayerAVA2.pause();
        } else {
            $(this).text("FECHAR O VÍDEO");                            
            myPlayerAVA2.play();
        }
        $('.video-container', $(this).parent().parent().parent()).animate({
            height: "toggle"
        }, 500);
    }); 
    */
   
   // Modal  que contem todas as outras, modals de notificações dentro (modalPai).
   // Ao fechar a modal, pausa o video
   $("#modalPai").on('hide.bs.modal', function(e){
        //e.preventdefault();
           myPlayer.pause();
   });  

   // Ao abrir a modal pai, deixa o video no começo.
   $("#modalPai").on('show.bs.modal', function(e){		
       //e.preventdefault();
       myPlayer.currenttime(0);		
       video.play();
   });
   
});