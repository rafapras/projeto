function WebService(url, callback, pars, showLoading) {
if (showLoading == undefined) {
        showLoading = true;
}
if(!pars){
        pars="{}";
    }
    $.ajax({
        data: JSON.stringify(pars),
        url: url,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: false,
        global: showLoading,
        success: function(json) {
            
            callback(json);
        },
        error: function(xml, status) {
            if ((status == 'error') || (status == "")) {
                try {
                    var json = eval('(' + xml.responseText + ')');
                   
                    //Verifica qual exceção retornou
                    switch (json.ExceptionType) {
                        //Faz a verificação da exceção para ver se foi sessão expirada

                        // MEXER
                        case "ControleVideo.Objeto.Excecoes.SessionException":
                            //Sessão expirou no webService. Redireciona para o login
                            alertModal("Efetue login novamente", alertType.erro);
                            window.location = 'Login.aspx';
                            break;

                        default:
                            alertModal(json.Message, alertType.erro);
                            break;
                    }

                } catch (e) { }
            } else {
                alertModal(status, alertType.erro);
            }
        },
        beforeSend: function(xml) {
            if (!this.data)
                xml.setRequestHeader("Content-Type", "application/json;utf-8");
        }
    });
}