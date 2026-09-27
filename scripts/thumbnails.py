'''
PIL's Image.thumbnail() returns an image that fits inside of a given size (preserving aspect ratios)
but the size of the actual image will vary and is certainly not guaranteed to be the requested size.
This is often inconvenient since the size of the returned thumbnail cannot be predicted. The django-thumbs
library solves this for square thumbnails by cropping the image to a square and then resizing it. However,
this only works for exact squares.

This script supports two fixed-size thumbnail strategies: center-cropping for post lead images and fitting
the full image on a white background for demo gallery images, where UI details near the edges matter.
'''

from PIL import Image
from glob import glob
import os
import re

THUMBNAIL_SUFFIX = re.compile(r'\.\d+x\d+$')

def flat( *nums ):
    'Build a tuple of ints from float or integer arguments. Useful because PIL crop and resize require integer points.'
    
    return tuple( int(round(n)) for n in nums )

class Size(object):
    def __init__(self, pair):
        self.width = float(pair[0])
        self.height = float(pair[1])

    @property
    def aspect_ratio(self):
        return self.width / self.height

    @property
    def size(self):
        return flat(self.width, self.height)

def cropped_thumbnail(img, size):
    '''
    Builds a thumbnail by cropping out a maximal region from the center of the original with
    the same aspect ratio as the target size, and then resizing. The result is a thumbnail which is
    always EXACTLY the requested size and with no aspect ratio distortion (although two edges, either
    top/bottom or left/right depending whether the image is too tall or too wide, may be trimmed off.)
    '''
    
    original = Size(img.size)
    target = Size(size)

    if target.aspect_ratio > original.aspect_ratio:
        # image is too tall: take some off the top and bottom
        scale_factor = target.width / original.width
        crop_size = Size( (original.width, target.height / scale_factor) )
        top_cut_line = (original.height - crop_size.height) / 2
        img = img.crop( flat(0, top_cut_line, crop_size.width, top_cut_line + crop_size.height) )
    elif target.aspect_ratio < original.aspect_ratio:
        # image is too wide: take some off the sides
        scale_factor = target.height / original.height
        crop_size = Size( (target.width/scale_factor, original.height) )
        side_cut_line = (original.width - crop_size.width) / 2
        img = img.crop( flat(side_cut_line, 0,  side_cut_line + crop_size.width, crop_size.height) )
        

    return img.resize(target.size, Image.Resampling.LANCZOS)

def contained_thumbnail(img, size):
    thumbnail = img.convert('RGBA')
    thumbnail.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', size, 'white')
    offset = ((size[0] - thumbnail.width) // 2, (size[1] - thumbnail.height) // 2)
    canvas.alpha_composite(thumbnail, offset)
    return canvas.convert('RGB')

def lead_photos(pattern, size, thumbnailer=cropped_thumbnail, overwrite=False):
    size = flat(*size)

    for filename in glob(pattern):
        basename, ext = os.path.splitext(filename)
        if THUMBNAIL_SUFFIX.search(basename):
            continue

        thumb_filename = basename + '.{}x{}'.format(*size) + ext

        # If the thumbnail does not yet exist, unless regeneration was requested.
        if overwrite or not os.path.isfile(thumb_filename):
            print('converting {}...'.format(filename))

            # make the thumbnail image
            with Image.open(filename) as img:
                thumb = thumbnailer(img, size)
                thumb.save(thumb_filename, optimize=True)
            print('saved {}.\n'.format(thumb_filename))

if __name__ == '__main__':
    lead_photos('static/post/*/lead.*', (192, 128))
    lead_photos('static/demos/*/lead.*', (192, 160), contained_thumbnail)


