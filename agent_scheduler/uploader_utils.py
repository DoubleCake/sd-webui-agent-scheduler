import os
import json
import platform
import gradio as gr
from PIL import Image
from uuid import uuid4
from typing import List
from collections import defaultdict
from datetime import datetime, timedelta
from modules import shared, script_callbacks, scripts
from modules.shared import list_checkpoint_tiles, refresh_checkpoints
from modules.ui import create_refresh_button
from modules.generation_parameters_copypaste import (
    registered_param_bindings,
    create_buttons,
    register_paste_params_button,
    connect_paste_params_buttons,
    ParamBinding,
)
import time

import shutil
from modules import localization, ui_components, shared_items, shared, interrogate, shared_gradio_themes,hashes
import logging
from modules import localization, ui_components, shared_items, shared, interrogate, shared_gradio_themes,hashes


import time,os,sys
import logging

if logging.getLogger().hasHandlers():
    #创建自己的logging 文件
    log_uploader = logging.getLogger('uoloaderLogger')
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    log_uploader.setLevel(logging.DEBUG)
    # 2、创建一个handler，用于写入日志文件
    fh = logging.FileHandler('ac_uploader.log')
    fh.setFormatter(formatter)
    fh.setLevel(logging.DEBUG)
    log_uploader.addHandler(fh)
    log_uploader.info("The initial upload was successful!!")

model_type_choices=["Lora","Stable-diffusion","VAE","embeddings"]
projects_type_choices=["Lora","ckpt","texture inversion"]
tmpFolder= scripts.basedir()+"/remote_models"
model_types=[[x,x.upper()] for x in [".ckpt",".bin",".pt",".safetensors"]]
file_types_filter=[]
for tmp in model_types:
    file_types_filter+=tmp


logger =logging.getLogger("uoloaderLogger")

def clear_tempdir(model_path):
    model_name= os.path.split(model_path)[-1]
    #直接对temp文件排序，将temp中的文件夹 按 时间顺序，查找到最新的文件。
    file_path = os.path.split(os.path.split(model_path)[0])[0]
    dir_list=[]
    logger.debug(f"dir_list length:{len(os.listdir(file_path))}")
    for folder in os.listdir(file_path):
        if os.path.isdir(os.path.join(file_path,folder)):
            dir_list.append(os.path.join(file_path,folder))

    dir_list = sorted(dir_list,  key=lambda x: os.path.getctime(x))
    logger.debug(f"dir_list length:{len(dir_list)}")
    
    #避免反复上传同一模型。 
    for folder in dir_list:
        if model_name in os.listdir(folder):
            try:
                os.remove(f"{folder}/{model_name}")
                os.rmdir(folder)
                logger.debug(f"remove :{folder}/{model_name}")
                continue
            except:
                pass

        if os.path.getctime(folder)<(time.time()-3600):
            for x in os.listdir(folder):
                if os.path.splitext(x)[-1].upper() in [".CKPT",".PT",".SAFETENSORS"]:
                    try:
                        logger.debug(f"remove old path :{folder}/{model_name}")
                        os.remove(f"{folder}/{model_name}")
                        os.rmdir(folder)
                    except:
                        pass



def hash_compare(file,model_type):
    if model_type =="embeddings":
        model_path = f"{shared.models_path}/../{model_type}"
    else:
        model_path = f"{shared.models_path}/{model_type}"

    with open("./cache.json","r") as f:
        caches_local = json.load(f)
    #当前模型hash
    cur_hash=hashes.sha256(file, "tmp", use_addnet_hash=False)
    logger.info(f"[cur_hash:{cur_hash}") 

    for model in os.listdir(model_path):
        file_path = os.path.join(model_path,model)
        file_name = os.path.splitext(model)[0]

        logger.info(f"[已有模型:{file_path}---{file_name}")
        
        try:
            if model_type=="Lora":
            
                tmp_hashes_from_cache=caches_local.get("safetensors-metadata").get(f"lora/{file_name}").get("value").get("sshs_model_hash")

            elif model_type=="Stable-diffusion":
                tmp_hashes_from_cache = caches_local.get("hashes").get(f"checkpoint/{file_name}")
        except:
            tmp_hashes_from_cache =None



        if cur_hash ==tmp_hashes_from_cache:
            return file_name
    
    return None

def upload_file(file):
    model_name = os.path.split(file.name)[-1]

    #记录被上传的文件
    logger.debug(f"upload_file:{file.name}")

    return [model_name,gr.HTML.update(value="点击确认上传")
    ]

def submit(model_type,model_file,PreviewImage):
    model_path= model_file.name
    if PreviewImage is None:
        raise  gr.Error("请选择上传的模型预览图")


    #计算哈希
    exist_model=hash_compare(model_path,model_type)
    if exist_model is not None:
        raise  gr.Error(f"上传失败,已有重复模型{exist_model})")
        
    # try:
    model_name = os.path.split(model_path)[-1]
    new_model_path =shared.models_path+ f"/{model_type}/{model_name}" 

    if type=="embeddings":
        new_model_path =shared.models_path+ f"/../{model_type}/{model_name}"
    logger.info(f" sd_path:{new_model_path}")    
    shutil.copy(model_path,new_model_path)
    im_name = new_model_path.replace( os.path.splitext(new_model_path)[-1], os.path.splitext(PreviewImage)[-1])
    shutil.move(PreviewImage,im_name)

    logger.info(f"上传模型成功：{new_model_path}")
    #清楚file中的文件
    logger.debug(f"Uploading model:{model_file.name}")

    #清理模型冗余，直接对temp文件排序
    clear_tempdir(model_path)
   


    return [gr.File.update(value=None), gr.HTML.update(value="上传成功!!!")]