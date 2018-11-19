//var dadosNome = "Clique e preencha o campo com seu nome completo*";
//var dadosEmail = "Clique e preencha o campo com seu email*"
var filtroEmail = /^.+@.+\..{2,}$/;
var caracterNaoPermitido = /[\(\)\<\>\,\;\:\\\/\"\[\]]/;

$(function () {
    btUpload($("#btnUpLoad"));
    $("#btnEnviar").click(enviaEmail);
    $("#txtEmail").val();
    $("#txtArquivo").attr("disabled", true);
});

function btUpload($tgt) {
    var cfgUpload = {
        action: "Upload.ashx",
        onSubmit: function (file, ext) {
            ext = (ext == null) ? null : ext.toString().toLowerCase();
            if (!(ext && /^(doc|docx|pdf)$/.test(ext))) {
                alert("Permitido o envio somente de arquivos do tipo .doc, .docx e .pdf.");
                return false;
            }
            this.disable();
        },
        onComplete: function (file, response) {

            $("#txtArquivo").val(file);
            this.enable();
            try { json = eval('(' + response + ')'); }
            catch (ev) { }
        }
    };
    new Ajax_upload($tgt, cfgUpload);
}

function enviaEmail() {
    var pars = {};
    var curriculo = {};

    var callback = function (json) {
        alert("Curriculo enviado com sucesso.");
    }

    curriculo.Nome = $("#txtNome").val();
    curriculo.Email = $("#txtEmail").val();
    curriculo.Deficiencia = $("#txtDeficiencia").val();
    curriculo.Adaptacao = $("#txtAdaptacao").val();

    if ($("#txtNome").val().length < 4) {
        alert("Preencha o nome corretamente");
    }

    else if (curriculo.Nome == "") {
        $("#txtNome").val(dadosNome);
        alert("Preencha o campo Nome");
    }

    else if (!(filtroEmail.test(curriculo.Email))) {
        alert("Preencha o campo Email corretamente");
    }

    else if ($("#txtArquivo").val() == "") {
        alert("Selecione o arquivo com seu curriculo");
    }

    else {
        pars.curriculo = curriculo;

        WebService("/ws/Email.asmx/EnviaCurriculo", callback, pars);
    }
}