import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
const isImageUrl = require('is-image-url');
import {filterImageFromURL, deleteLocalFiles} from '../../../util/util';
import { runInNewContext } from 'vm';

const router: Router = Router();
router.use(bodyParser.json());

router.route('/')
.get(async(req: Request, res: Response, next) => {
    let {image_url} = req.query;
    let absolutePath: string;
    if(!image_url) {
        res.status(400).send('Please provide Image Url ');
    }

    if (!isImageUrl(image_url)) {
        res.status(400).send('Not a valid image');
    }

    filterImageFromURL(image_url)
    .then((filePath) => {
        absolutePath = filePath;
        console.log('Path of modified file ' + filePath);
        res.status(200).sendFile(filePath, {},  (err: Error) =>  {
            if(err) {
                res.status(500).send('Some Error Occured');
            } else {

                console.log('Deleting Local file ' + filePath);
                let file: string[] = [filePath];
                deleteLocalFiles(file);

            }
        });       
    }, (err) => next(err))
    .catch((err) => {
        res.status(500).send('Some Error Occured');
    })


});


export const FilterImageRouter: Router = router;
