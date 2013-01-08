/*
 * We Dance
 */
/*
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI.add('wedance-edit', function (Y) {
    "use strict";

    var Overlay = Y.Base.create("overlay", Y.Widget, [Y.WidgetParent, Y.WidgetPosition, Y.WidgetPositionAlign, Y.WidgetStack], {}, {});

    var Tab = Y.Base.create("tab", Y.Tab, [], {}, {
        ATTRS: {
            content: {
                setter: function () {
                    console.log("caught");
                }
            }
        }
    });

    var jp,
    PictoPlumb =  Y.Base.create("pictoplumb", Y.Widget, [], {

        CONTENT_TEMPLATE: "<div>"
        + "<div class=\"part head\"></div>"
        + "<div class=\"part neck\"></div>"
        + "<div class=\"part ass\"></div>"
        + "<div class=\"part lfoot\"></div>"
        + "<div class=\"part rfoot\"></div>"
        + "<div class=\"part lshoulder\"></div>"
        + "<div class=\"part rshoulder\"></div>"
        + "<div class=\"part lhand\"></div>"
        + "<div class=\"part rhand\"></div>"
        +"</div>",

        renderUI: function() {
            window.jsPlumb.ready(Y.bind(this.initJsPlumb, this));
        },

        initJsPlumb: function() {
            var cb = this.get("contentBox");

            this.jp = window.jsPlumb.getInstance({
                Container: cb,
                Anchor: "Continuous",
                Endpoint: ["Dot", {
                    radius: 1
                }],
                PaintStyle: {
                    lineWidth: 3,
                    strokeStyle: "black",
                    outlineColor: "white",
                    outlineWidth: 0
                }
            });
            var i, o, n, data = this.get("data");
            for (i in data) {
                n = cb.one("." + i);
                o= data[i];
                //n.setXY(data[i]);
                n.setStyles({
                    top: o[0] * 2,
                    left: o[1] * 2 + 200
                });
                this.jp.draggable(n);
            }
            this.connect(cb.one(".head"), cb.one(".neck"));
            this.connect(cb.one(".neck"), cb.one(".ass"));
            this.connect(cb.one(".neck"), cb.one(".lhand"));
            this.connect(cb.one(".neck"), cb.one(".rhand"));
            this.connect(cb.one(".ass"), cb.one(".rfoot"));
            this.connect(cb.one(".ass"), cb.one(".lfoot"));
        },
        connect: function (source, target) {
             this.jp.connect({
                    source: source,
                    target: target,
                    connector:"Straight",
                    deleteEndpointsOnDetach: true,
                    uniqueEndpoint: true,
                    parameters: {
                        transition: this
                    },
                    anchors:["Center", "Center"],
                    paintStyle:{
                        lineWidth:9,
                        strokeStyle: "black",
                        outlineColor:"#666",
                        outlineWidth:0,
                        joinstyle:"round"
                    },
                    endpoint:"Blank"
                //detachable:false,
                //endpointsOnTop:false,
                //endpointStyle:{
                //radius:95,
                //fillStyle: "black"
                //}
                });
        }
    }, {
        ATTRS: {
            data: {
                value: {
                    head: [50, 50],
                    neck: [80, 50],
                    ass: [150, 50],
                    lfoot: [200, 30],
                    rfoot: [200, 70],
                    lhand: [150, 30],
                    rhand: [150, 70]
                }
            }
        }
    });

    var FileLibrary = Y.Base.create("scrollview", Y.ScrollView, [], {

        renderUI: function () {
            FileLibrary.superclass.renderUI.call(this);

            this.menu = new Overlay({
                visible: false,
                zIndex: 1,
                render: true
            });
            this.menu.render();

            this.panel = new Y.Panel({
                width: 700,
                height: 500,
                visible: false,
                modal: true,
                centered: true,
                zIndex: 1
            });
            this.panel.render();

            var i, moves = Y.wedance.app.get("track.moveLibrary"),
            cb = this.get("contentBox"),
            menuCb = this.menu.get("contentBox");

            for (i in moves) {
                cb.append("<div class=\"file\"><img src=\"" + Y.wedance.app.get("base") + moves[i].url + "\" /><br />" + moves[i].url + "</div>");
            }
            //this._uiDimensionsChange();
            cb.delegate("mouseenter", function (e){
                this.menu.show();
                this.menu.target = e.currentTarget;
                this.menu.set("align", {
                    node: e.currentTarget,
                    points:["tr", "tr"]
                });
            }, ".file", this);

            menuCb.setHTML("<div class=\"icon-edit\"></div><div class=\"icon-delete\"></div>");
            menuCb.one(".icon-edit").on("click", function () {
                var picto = new PictoPlumb();
                picto.render(this.panel.get("contentBox"));
                this.panel.show();
            }, this);
            menuCb.one(".icon-delete").on("click", function () {
                this.menu.target.remove(true);
                this.menu.hide();
            }, this);
        }
    });

    var SimpleWidget = Y.Base.create("wedance-simplewidget", Y.Widget, [], {

        CONTENT_TEMPLATE: "<div><div class=\"startl\">0:00</div></div>",

        renderUI: function () {
            this.get("contentBox").append(this.get("content"));
            this.set("height", (this.get("data.end") - this.get("data.start")) * 100);
        },
        syncUI: function () {
            this.set("data.start", this.get("data.start"));
        }
    }, {
        ATTRS: {
            content: {
                value: ""
            },
            data: {
                setter: function (val, param) {
                    if (param === "data.start") {
                        this.get("contentBox").one(".startl").setHTML(SimpleWidget.rightPad(val.start, 2));
                    }
                    return val;
                }
            }
        },
        rightPad: function (val, targetLength) {
            var i, p = Math.pow(10, targetLength),
            output = (Math.round(val * p) / p) + '', left;

            if (output.split(".").length === 1) {
                output += ".";
                left = targetLength;
            }else {
                left = targetLength - output.split(".")[1].length;
            }

            for (i = 0; i < left; i += 1) {
                output += '0';
            }
            return output;
        }
    });

    var KaraokeEditor = Y.Base.create("wedance-karaokeeditor", Y.wedance.Karaoke, [], {
        CONTENT_TEMPLATE: "<div><div class=\"scroll\"></div></div>",
        SCROLLVIEWWIDTH: "100%",

        renderUI: function () {
            var cb = this.get("contentBox");

            this.moves = [];

            this.scrollView = new Y.ScrollView({
                srcNode: cb.one(".timeline"),
                width: this.SCROLLVIEWWIDTH,
                height: (Y.DOM.winHeight() / 2) - 29,
                flick: {
                    minDistance:10,
                    minVelocity:0.3,
                    axis: "y"
                }
            });
            this.scrollView.render();

            this.menu = new Overlay({
                visible: false,
                zIndex: 1,
                render: true
            });
            this.menu.render();
            this.menu.get("contentBox").setHTML("<div class=\"icon-delete\"></div>");
            this.menu.get("contentBox").one(".icon-delete").on("click", function () {

                }, this);

            cb.one(".timeline").delegate("mouseenter", function (e){
                this.menu.show();
                this.menu.target = e.currentTarget;
                this.menu.set("align", {
                    node: e.currentTarget,
                    points:["tr", "tr"]
                });
            }, ".picto", this);
            //cb.one(".timeline").delegate("mouseleave", this.menu.hide, ".picto", this.menu);


            Y.io(this.get("simpleKRLUri"), {
                context: this,
                on: {
                    success: function (tId, e) {
                        var i, t,
                        timings = RiceKaraoke.simpleTimingToTiming(Y.JSON.parse(e.response)), // Simple KRL -> KRL
                        cb = this.scrollView.get("contentBox"),
                        w = new SimpleWidget({
                            data: {
                                start: 0,
                                end: timings[0].start,
                                index: -1
                            },
                            plugins: [{
                                fn: Y.Plugin.Resize,
                                cfg: {
                                    handles: "b"
                                }
                            }]
                        });
                        w.resize.on("resize:resize", this.onMoveResize, this);
                        w.render(cb);

                        for (i = 0; i < timings.length; i += 1) {
                            t = timings[i];
                            t.index = i;

                            w = new SimpleWidget({
                                content: "<div class=\"picto\" style=\"background:url(../images/087.png)\"></div>",
                                data: t,
                                plugins: [{
                                    fn: Y.Plugin.Resize,
                                    cfg: {
                                        handles: "b"
                                    }
                                }]
                            });
                            w.resize.on("resize:resize", this.onMoveResize, this);
                            w.render(cb);
                            this.moves.push(w);
                        }
                        //this.scrollView._uiDimensionsChange();
                        Y.later(this.get("rate") * 1000, this, this.step, null, true);
                    },
                    failure: function () {
                        alert("Error loading karaoke track.");
                    }
                }
            });

        },

        step: function () {
            this.get("currentTime");
        },

        onMoveResize: function (e) {
            var i, m, w =  e.currentTarget.get("widget"),
            offset = - w.get("data.end")  + w.get("data.start") + this.height2Time(w.get("height"));
            //   console.log(offset);

            w.set("data.end", w.get("data.start") + this.height2Time(w.get("height")));

            for (i = w.get("data.index") + 1; i < this.moves.length; i += 1) {
                m = this.moves[i];
                m.set("data.start", m.get("data.start") + offset);
                m.set("data.end", m.get("data.end") + offset);
            }

        },
        height2Time: function (height) {
            return height/100;
        },
        time2Height: function (time) {
            return time * 100;
        }
    });
    Y.namespace('wedance').KaraokeEditor = KaraokeEditor;

    var MovesEditor = Y.Base.create("wedance-moveseditor", Y.wedance.KaraokeEditor, [], {


        CONTENT_TEMPLATE: "<div><div class=\"timeline\"></div><div class=\"movelibrary\"></div><div style=\"clear:both\"></div></div>",

        renderUI: function () {
            this.SCROLLVIEWWIDTH = Y.DOM.winWidth() - 300+ "px";
            MovesEditor.superclass.renderUI.call(this);

            this.fileLibrary = new FileLibrary({
                srcNode: this.get("contentBox").one(".movelibrary"),
                width: "298px",
                height: (Y.DOM.winHeight() / 2) - 29,
                flick: {
                    minDistance:10,
                    minVelocity:0.3,
                    axis: "y"
                }
            });
            this.fileLibrary.render();
        },

        step: function () {
            this.get("currentTime");
        }
    });
    Y.namespace('wedance').MovesEditor = MovesEditor;

    var Editor = Y.Base.create("wedance-edit", Y.wedance.Track, [], {

        renderUI: function () {
            Editor.superclass.renderUI.apply(this, arguments);
            this.player.set("height", Y.DOM.winHeight() / 2);

            this.tabview = new Y.TabView({
                height: Y.DOM.winHeight() / 2,
                children: [{
                    label: 'Moves',
                    type: Tab
                }, {
                    label: 'Karaoke',
                    type: Tab
                }, {
                    label: 'Move designer',
                    type: Tab
                }]
            });

            this.tabview.after("render", function (e) {
                // var t = this.tabview.item(this.tabview.get("selection"));
                var t = this.tabview.item(0);
                this.renderTab(t.get("label"), t);

            }, this);

            this.tabview.render(this.get("boundingBox"));
            return;

            this.tabview.after("render", function (e) {
                this.tabview.after("selectionChange", function (e) {
                    return;

                    var t = e.newVal || e.details[0].newVal;
                    if (t && t.get("content") === "") {
                        this.renderTab(t.get("label", t));
                    }
                });
            });

        },


        renderTab: function (type, tab) {
            switch (type) {
                case "Moves":
                    this.movesEditor = new MovesEditor(Y.wedance.app.get("track.moves"));
                    this.movesEditor.render(tab.get("panelNode"));
                    break;

                case "Karaoke":
                    this.karaokeEditor = new KaraokeEditor(Y.wedance.app.get("track.karaoke"));
                    this.karaokeEditor.render(tab.get("panelNode"));
                    break;
            }
        }
    });
    Y.namespace('wedance').Editor = Editor;

});
