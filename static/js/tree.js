$(function () {
  $("ul.collapsible-tree").each(function () {
    var $tree = $(this);
    var dragStarted = false;
    var downX = 0;
    var downY = 0;

    function prepareList($ul, prefix) {
      $ul.children("li").each(function (index) {
        var $li = $(this);
        var number = prefix.concat(index + 1);
        var label = number.join(".") + ". ";
        var $children = $li.children("ul");
        var $line = $("<span class=\"tree-line\"></span>");
        var $number = $("<span class=\"tree-number\"></span>").text(label);
        var $text = $("<span class=\"tree-text\"></span>");

        $li.contents().filter(function () {
          return !(this.nodeType === Node.ELEMENT_NODE && this.tagName.toLowerCase() === "ul");
        }).each(function () {
          $text.append(this);
        });

        $text.contents().filter(function () {
          return this.nodeType === Node.TEXT_NODE;
        }).first().each(function () {
          this.nodeValue = this.nodeValue.replace(/^\s+/, "");
        });

        $line.append($number, $text);
        $li.prepend($line);

        if ($children.length) {
          $li.addClass("collapsible").attr("aria-expanded", "false");
          $children.hide();
          $children.each(function () {
            prepareList($(this), number);
          });
        }
      });
    }

    prepareList($tree, []);

    $tree.on("mousedown", "li.collapsible > .tree-line", function (event) {
      dragStarted = false;
      downX = event.pageX;
      downY = event.pageY;
    });

    $tree.on("mousemove", "li.collapsible > .tree-line", function (event) {
      if (Math.abs(event.pageX - downX) > 4 || Math.abs(event.pageY - downY) > 4) {
        dragStarted = true;
      }
    });

    $tree.on("click", "li.collapsible > .tree-line", function (event) {
      event.stopPropagation();

      if (dragStarted || String(window.getSelection()).length > 0) {
        dragStarted = false;
        return;
      }

      var $li = $(this).parent("li");
      var expanded = $li.hasClass("expanded");

      $li.toggleClass("expanded", !expanded)
        .attr("aria-expanded", String(!expanded))
        .children("ul").first().toggle(!expanded);
    });
  });
});
