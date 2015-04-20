var socket = io('http://127.0.0.1:2323/');
var ClientsModel=function(){
    var self=this;
    self.mudClients=ko.observable([]);
    self.currentMudClients=ko.observable();
    self.currentInfo=ko.observable({id:null,connected:null})
};
var clientsModel=new ClientsModel();
$(function(){
$lines=$('#lines');
$output=$('#output');
$prompt=$('#prompt');
$input=$('#input');
var lineBuilder=new LineBuilder();
ko.applyBindings(clientsModel);
var insertLine=function(data)
{
        var line=lineBuilder.exec(data);
        if (line)
        {
            var $li=$('<li/>');
            $li.html(line);
            $lines.append($li);
            
        }
    
}
var updatePrompt=function()
{
        $prompt.html(lineBuilder.getPrompt());
        $input.css('text-indent',$prompt.width());
    
}
var checkScroll=function()
{
    return $lines.position().top+$lines.outerHeight()-$output.height()<10;
}
  socket.on('currentClientResult',function(result){
        var needPosition=checkScroll();
        insertLine(result.rawDatas);
        updatePrompt();
        if (needPosition){$output.scrollTop($lines.height())}
  });
socket.on('updateClients',function(clientList){
    clientsModel.mudClients(_.values(clientList));
    return;
});
socket.on('updateBuffer',function(data){
        console.log(data);
        if (data!=null && data.lines!=null){
            $lines.html('');
            var lines=data.lines;            
            for (var i in lines)
            {
                insertLine(lines[i].rawDatas);
            }
            updatePrompt();
            $output.scrollTop($lines.height());
        }
})
socket.on('updateCurrent',function(info){
    if (info==null)
    {
        $('#page-wrapper').addClass('null')
        clientsModel.currentInfo({
            id:null,
            connected:null,
        });
        return;
    }
        $('#page-wrapper').removeClass('null')
        clientsModel.currentInfo(info);    
});
$('#clientList,#main-menu-clients-list').on('click','li',function(){
    var id=$(this).attr('data-id');
    socket.emit('setCurrentClient',id);
    socket.emit('queryCurrentBuffer');
});
var error_msg_template=_.template($('#error-msg-template').html());
var client_edit_modal_template=_.template($('#client-setting-template').html());
$('body').on('click','#client-setting-modal button#client-setting-modal-save',function(){
    $.post('/currentClient/update/',$('#client-setting-modal form').serializeArray(),function(data){
        if(data.errors)
        {
                    $('#client-setting-modal .error-msg').html(error_msg_template({errors:data.errors}));            
        }else{
                    $('#client-setting-modal').modal('hide');            
        }
    },'json')
});
    
$('#page-wrapper').on('click','#client-toolbar-edit-button',function(){
    $.get('/currentClient/settings',function(data){
        if (data){
            var html=client_edit_modal_template({settings:data});
            $('#client-setting-modal .modal-content').html(html);
            $('#client-setting-modal').modal('show');
        }
    },'json')
});
var client_delete_modal_template=_.template($('#client-delete-template').html());
$('#page-wrapper').on('click','#client-toolbar-delete-button',function(){
            var html=client_delete_modal_template({currentInfo:clientsModel.currentInfo()});
            $('#client-setting-modal .modal-content').html(html);
            $('#client-setting-modal').modal('show');
});
$('body').on('click','#client-setting-modal button#client-setting-modal-delete',function(){
    $.post('/currentClient/delete',$('#client-setting-modal form').serializeArray(),function(data){
        if(data.errors)
        {
                    $('#client-setting-modal .error-msg').html(error_msg_template({errors:data.errors}));            
        }else{
                    $('#client-setting-modal').modal('hide');            
        }
    },'json')
});
$('#page-wrapper').on('click','#client-toolbar-connect-toggle-button',function(){
        socket.emit('toggleCurrentConnect');
});
$('#page-wrapper').on('click','#client-toolbar-close-button',function(){
    socket.emit('setCurrentClient',null);    
});
socket.emit('queryClients');
socket.emit('queryCurrent');    
socket.emit('queryCurrentBuffer');    
    $input.keypress(function(event){
        if (event.which==13)
        {
            socket.emit('sendToCurrent',$(this).val());
            //lineBuilder.clearPrompt();
            $output.scrollTop($lines.height(),500);
            $(this).val('');
        }
    });
})