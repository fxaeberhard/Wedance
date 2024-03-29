/*
 * Wedance
 */
package com.wedance.core.rest.util;

import com.sun.jersey.spi.container.ContainerRequest;
import com.sun.jersey.spi.container.ContainerRequestFilter;
import com.sun.jersey.spi.container.ContainerResponseFilter;
import com.sun.jersey.spi.container.ResourceFilter;
import com.wedance.core.ejb.RequestManagerFacade;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
public class ViewRequestFilter implements ContainerRequestFilter, ResourceFilter {

    private final static Logger logger = LoggerFactory.getLogger(ViewRequestFilter.class);

    /**
     *
     *
     * @param cr
     * @return
     */
    @Override
    public ContainerRequest filter(ContainerRequest cr) {
        RequestManagerFacade rmf = RequestManagerFacade.lookup();

        // Handle language parameter
        if (cr.getHeaderValue("lang") != null
                && !cr.getHeaderValue("lang").isEmpty()) {
            rmf.setLocale(new Locale(cr.getHeaderValue("lang")));
        } else if (cr.getHeaderValue("Accept-Language") != null && !cr.getHeaderValue("Accept-Language").isEmpty()) {
            rmf.setLocale(new Locale(cr.getHeaderValue("Accept-Language")));
        } else {
            rmf.setLocale(Locale.getDefault());
        }

        // Handle view parameter
        String newUri = cr.getRequestUri().toString();
        String firstPathSeg = cr.getPathSegments().get(0).getPath();
        switch (firstPathSeg) {
            case "Index":
            case "Public":
            case "Private":
            case "Export":
            case "Editor":
                rmf.setView(this.stringToView(firstPathSeg));
                newUri = newUri.replace(firstPathSeg + "/", "");
                break;
        }

        try {
            cr.setUris(cr.getBaseUri(), new URI(newUri));
        } catch (URISyntaxException ex) {
            logger.error(null, ex);
        }

        if (cr.getQueryParameters().get("view") != null) {                      // If the view is given through a query parameter
            rmf.setView(this.stringToView(cr.getQueryParameters().get("view").get(0)));
        }

        return cr;
    }

    public Class stringToView(String str) {
        switch (str) {
            case "Index":
                return Views.Index.class;

            case "Private":
                return Views.Private.class;

            case "Export":
                return Views.Export.class;

            case "Editor":
                return Views.Editor.class;

            case "Public":
            default:
                return Views.Public.class;
        }

    }

    @Override
    public ContainerRequestFilter getRequestFilter() {
        return this;
    }

    @Override
    public ContainerResponseFilter getResponseFilter() {
        return null;
    }
}
