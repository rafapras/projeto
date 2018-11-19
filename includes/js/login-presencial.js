function Login(){

    var _encode = function(str) { 
        var o1, o2, o3, bits, h1, h2, h3, h4, e=[], pad = '', c = str.length % 3, coded, 
            b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

        if (c > 0) { while (c++ < 3) { pad += '='; str += '\0'; } }
        for (c=0; c<str.length; c+=3) { 
            o1 = str.charCodeAt(c);o2 = str.charCodeAt(c+1);o3 = str.charCodeAt(c+2);
            bits = o1<<16 | o2<<8 | o3;h1 = bits>>18 & 0x3f;h2 = bits>>12 & 0x3f;h3 = bits>>6 & 0x3f;h4 = bits & 0x3f;
            e[c/3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        }
        coded = e.join('');
        return coded.slice(0, coded.length-pad.length) + pad;
    };

    this.logar = function(param){

        param.url = $.trim(param.url);
        param.login = $.trim(param.login);
        param.senha = $.trim(param.senha);
        param.success = (typeof param.success == 'function') ? param.success : function() {};
        param.error = (typeof param.error == 'function') ? param.error : function() {};
    
        if(param.login == '' || param.senha == ''){
            param.error('Por favor, preencha todos os campos.');
            return;
        }
        try {

            $.ajax({
                url: param.url, 
                data: { matricula: param.login, senha: _encode(param.senha) },
                type: 'post',
                dataType: 'json',
                success: function(json){
                    //if(json.Instituto == "SEPI")  json = _criaFakeHomologacao(json); // fakes para teste dos sistemas

                    if(json != null && json.Valido){
                        window.localStorage.setItem("dados", JSON.stringify(json));
                        window.sessionStorage.setItem("dados", JSON.stringify(json));
                        param.success(json);
                    } else{
                        param.error(json.Mensagem);
                    }
                },
                error: function(){ param.error('Erro ao tentar efetuar o Login.'); }
            });
        } catch(ex){ param.error(ex.message); }
    };
    
    this.logout = function(){ 
        window.localStorage.removeItem("dados"); window.localStorage.removeItem("Sistema"); 
        window.sessionStorage.removeItem("dados");
    };

    this.getSessao = function(){
        var sessao = JSON.parse(window.localStorage.getItem("dados") || window.sessionStorage.getItem("dados") || '{}');

        if(window.localStorage.getItem("dados") == null){
            window.localStorage.setItem("dados", JSON.stringify(sessao));
        }

        if(sessao.DataExpiracao == undefined || 
            (new Date().getTime() - sessao.DataExpiracao) > 0 || 
            (sessao.Instituto == 'SEPI' && (window.sessionStorage.getItem("dados") == null || window.sessionStorage.getItem("dados") == ''))
        ){
            this.logout(); sessao = {};
        }
        return sessao;
    };
}

var api = '/ead/api/servicos';

$(function () {

    var login = new Login();
    var sessao = login.getSessao();
    
    if (sessao != null && sessao.Valido) { // logado
        $('.cont-user-log .nome-logado').text(sessao.Nome);
        $('.cont-user-log .email-logado').text(sessao.Email);
        // alert($("a.link .cont-user-log").val());
     
        if (sessao.Instituto == "SEPI") {
       //     alert("ead");
            $("a.btn-area").attr("href", "/ead/home/logado/");
        } else {
        //    alert("presencial");
            $("a.btn-area").attr("href", "/presencial/central/");
        }
        $('.login-mobile, a.text-login-mobile').hide().removeClass('showmobile');
       

        // mostra
        $('.cont-user-log, a.area-do-aluno').removeClass('hide');
        $('.cont-user-log').removeClass('user-logout-mob');
        $('.form-login').addClass('hide');
    } else {
        $('a.area-do-aluno').addClass('hide');
        $('.form-login').removeClass('hide');
    }
    $('.form-login').parent().css({"min-height":"0"});

    $('.btn-sair').click(function (ev) {
        ev.preventDefault(); login.logout(); window.location = "/presencial/";
    });

    //alterado 07/02/2018 as 11:45 (o aluno não entrava no sistema, erro o live click)

    //$('.form-login input[type=password]').live("keypress", function (e) {
    //    if (e.keyCode == 13) {
    //        $($(e.target).parents('form')[0]).find('.btn-login-topo').trigger('click');
    //    }
    //});

    $('.form-login input[type=password]').on("keypress", function (e) {
        if (e.keyCode == 13) {
            $($(e.target).parents('form')[0]).find('.btn-login-topo').trigger('click');
        }
    });

    $('.btn-login-topo, .btn-login-mobile').click(function (ev) {
        
        ev.preventDefault();
     //   var $form = $(this).parents('form').first();
        var $form = $(this).parents('form');
        $('.form-login').hide();

        login.logar({
            url: api + '/usuarios/autenticacao/', 
            login: $('input[type=text]', $form).val(),
            senha: $('input[type=password]', $form).val(),
            success: function (json) {             
                window.location = (json.Instituto == "SEPI") ? "/ead/home/logado/" : "/presencial/central/";
            },
            error: function(msg){
                $('.form-login').show(); alert(msg);
            }
        });
    });
    
    //$('#matricula1, #senha1').on('keypress', function (ev) {
    //    if (ev.keyCode == 13) $('.btn-login-topo').trigger('click');
    //});

    $('#btn_esqueceu_senha, #btn_esqueceu_senhaMob').click(function(e){

        e.preventDefault();
        var matricula = $.trim($('#matricula1').val()) == '' 
            ? $.trim($('#matricula2').val()) : $.trim($('#matricula1').val());
        
        if(matricula == ''){
            alert('Por favor, preencha o campo matrícula para continuar');
            return;
        }

        $.get(api + '/usuarios/esqueceuSenha/' + matricula)
            .done(function(json){
                alert(json.Mensagem);
            }).error(function(){
                alert('Ocorreu um erro ao tentar enviar a senha');
            });
    });

    $('.btn-user-login-mobile a').click(function (ev) { ev.stopPropagation(); });

    $(document)
        .ajaxSend(function () { $('.loader-double').addClass("is-active"); })
        .ajaxStop(function () { $('.loader-double').removeClass("is-active"); });

});


function _criaFakeHomologacao(json){

    json.Sistemas = [];
    
    json.Sistemas.push({
        "Id":140,
        "Descricao":"Atendimento",
        "Url":"http://200.174.103.116/atendimento/Alunos/Autenticacao/index/" + json.Token,
        "NovaJanela":false
    });
    json.Sistemas.push({
        "Id":145,
        "Descricao":"AVA",
        "Url":"https://sistemas.unip.br/centralsistemaservico/acesso/?token=" + json.Token + "&sistema=blackboard",
        "NovaJanela":true
    });
    json.Sistemas.push({
        "Id":139,
        "Descricao":"Trabalhos Academicos",
        "Url":"https://trabalhosacademicos.unip.br/entrega/?token=" +json.Token,
        //"Url":"http://200.174.103.116/trabalhosacademicos/entrega/?token=" +json.Token,
        "NovaJanela":false
    });

    return json;
}