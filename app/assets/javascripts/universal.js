$(function(){
  //Generic show/hide dropdown
  $('select.showhide').on('change firstcheck', function(){
    $(this).find('option').each(function(){
      $($(this).data('show')).toggle($(this).is(':selected'));
    });
  }).trigger('firstcheck');

  //Envelope-maker
  $('input[name="env_node_count"]').on('change keyup', function(){
    var $currNodes = $('#envelope_nodes').children();
    if($currNodes.length < $(this).val()) {
      for(var i=0; i<$(this).val()-$currNodes.length; i++) {
        $('#envelope_nodes').append('<div>Ramp: <select name="env_gain_ramp[]"><option>set</option><option>linear</option><option>exponential</option></select> Time: <input name="env_time[]"/> Target gain: <input name="env_gain[]"/></div>');
      }
    } else if($currNodes.length > $(this).val()) {
      $currNodes.slice($(this).val()).remove();
    }
  }).trigger('change');
});
