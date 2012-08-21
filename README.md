# Emily Carr eBook Application

## Contact

 * Haig: haig.armen@gmail.com - 778-881-6676
 * Alex: alex@alexandrasamuel.com
 * Kenneth: hello@kennethormandy.com

## Wordpress API

 * http://book.hyko.org/api/
 
## Setup

    $ /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security
    
    
## High Level

 - Decades TOC
   - Years TOC
     - Chapters TOC
       - Sections
         - Comments
       
### Decades
 We add a tag for the decade to filter them out quickly.
 * Endpoint - http://book.hyko.org/api/get_tag_posts/?tag=decade