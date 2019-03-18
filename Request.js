$.ajax({
  url: "http://young.sp2mi.univ-poitiers.fr/cgi-bin/form-prep/marc/LRR.act",
  type: "get", //send it through get method
  data: {
    x1: 3,
    x2: 2,
    x3: 0,
    x4: 0,
    x5: 0,
    x6: 0,
    x7: 0,
    x8: 0,
    x9: 0,
    y1: 2,
    y2: 1,
    y3: 0,
    y4: 0,
    y5: 0,
    y6: 0,
    y7: 0,
    y8: 0,
    y9: 0
  },
  success: function(response) {
    document.body.appendChild(response);
  },
  error: function(xhr) {
    alert("Error");
  }
});
