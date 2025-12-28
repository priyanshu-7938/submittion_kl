import Knowledge from "../services/knowledge/index.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Request, Response } from "express";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const hydrateCustomController = async (req: Request,res: Response)=>{
    try{
        const insertionString: string = req.body.insertString;
        if(insertionString){
            await Knowledge.ingestDocument(insertionString).catch((e)=>{
                res.status(500).send("Eror while updating db.")
            });
        }
        res.status(200).send("Hydrated the db with custom string");
    }catch(e: any){
        console.log(e);
        res.status(500).send("failed to hydrate the db, Maybe the file does not exist.")
    }
}

const hydrateController = async (req: Request,res: Response)=>{
    try{
        // hard code to avoide flood hydration, db allready hydrated!
        res.send("Not allowed to hydrate now!");
        return;
        const file = fs.readFileSync(path.join(currentDir, "../data", "business_info.txt"), "utf-8");
        console.log(file);
        if(file){
            await Knowledge.ingestDocument(file).catch((e)=>{
                res.status(500).send("Eror while updating db.")
            });
        }
        res.send("Hydrated the db.")
    }catch(e: any){
        console.log(e);
        res.status(500).send("failed to hydrate the db, Maybe the file does not exist.")
    }
}

export {
    hydrateController,
    hydrateCustomController,
}