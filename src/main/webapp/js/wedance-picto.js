/**
 * We Dance
 */
/*
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI.add('wedance-picto', function (Y) {
    "use strict";

    var Picto = Y.Base.create("wedance-picto", Y.Widget, [], {

        CONTENT_TEMPLATE: null,

        bindUI: function () {
            this.updateHandler = Y.on("pictoUpdated", function (e) {
                if (this.get("id") === e.picto.id) {
                    this.setAttrs(e.picto);
                    this.syncUI();
                }
            }, this);
        },

        syncUI: function () {
            this.get("boundingBox").empty();

            switch (this.get("@class")) {
                case "UrlPicto":
                    this.get("boundingBox").setStyles({
                        backgroundImage: "url(" + Y.wedance.app.get("base") + this.get("url") + ")"
                    });
                    break;

                case "FilePicto":
                    this.get("boundingBox").setStyles({
                        backgroundImage: "url(" + Y.wedance.app.get("base") + "rest/Picto/Read/" + this.get("id") + ")"
                    });
                    break;

                case "VectorPicto":
                    this.renderVecto();
                    break;

            }
        },

        destructor: function () {
            this.updateHandler.detach();
        },

        toObject: function () {
            var i,ret = {}, filter = ["id", "@class", "url", "content", "name"];
            for (i = 0; i < filter.length; i += 1) {
                ret[filter[i]] = this.get(filter[i]);
            }
            return ret;
        },
        /* Private methods */
        renderVecto: function () {
            var color = "#ED008C",
            g = new Y.Graphic({
                render: this.get("boundingBox")
            }),
            l = g.addShape({
                type: "path",
                stroke: {
                    weight: 3,
                    linecap: "round",
                    color: color
                },
                fill: {
                    color: color
                }
            }),
            lineTo = function(src, target) {
                l.moveTo(src[1], src[0]);
                l.lineTo(target[1], target[0]);
            },
            data = Y.JSON.parse(this.get("content"));

            g.addShape({
                type: "circle",
                x: data.head[1] - 10,
                y: data.head[0] - 10,
                radius: 10,
                fill: {
                    color: color
                },
                stroke: {
                    weight:0
                }
            });
            lineTo(data.head, data.neck);
            lineTo(data.neck, data.ass);
            lineTo(data.neck, data.lelbow);
            lineTo(data.neck, data.relbow);
            lineTo(data.lelbow, data.lhand);
            lineTo(data.relbow, data.rhand);
            lineTo(data.ass, data.rknee);
            lineTo(data.ass, data.lknee);
            lineTo(data.rknee, data.rfoot);
            lineTo(data.lknee, data.lfoot);
            l.end();
        }

    }, {
        ATTRS: {
            "@class": {},
            name: {},
            url: {},
            content: {},
            width: {
                value: 100
            },
            height: {
                value: 100
            }
        }
    });
    Y.namespace("wedance").Picto = Picto;

});
