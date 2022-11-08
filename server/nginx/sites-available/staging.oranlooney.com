server {
    listen 80;
    listen [::]:80;

    server_name staging.oranlooney.com;

    root /var/www/staging.oranlooney.com/public;
    index index.html;
    error_page 404 /404.html;

    # turn off caching entirely for easier development
    expires epoch;
    etag off;

    location / {
        rewrite ^/deep-copy-javascript/?$ /post/deep-copy-javascript/ permanent;
        rewrite ^/apparently-ipad-developer/?$ /post/apparently-ipad-developer/ permanent;
        rewrite ^/semantic-code/?$ /post/semantic-code/ permanent;
        rewrite ^/author/?$ /about/ permanent;

        try_files $uri $uri/ =404;
    }
}
