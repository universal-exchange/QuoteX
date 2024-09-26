
# -*- coding: utf-8 -*-

# Copyright (c) 2024-2024 the DerivX authors
# All rights reserved.
#
# The project sponsor and lead author is Xu Rendong.
# E-mail: xrd@ustc.edu, QQ: 277195007, WeChat: xrd_ustc
# See the contributors file for names of other contributors.
#
# Commercial use of this code in source and binary forms is
# governed by a LGPL v3 license. You may get a copy from the
# root directory. Or else you should get a specific written 
# permission from the project author.
#
# Individual and educational use of this code in source and
# binary forms is governed by a 3-clause BSD license. You may
# get a copy from the root directory. Certainly welcome you
# to contribute code of all sorts.
#
# Be sure to retain the above copyright notice and conditions.

# 示例说明：
# 1、演示 quotex_center 行情中心父级插件的使用；
# 2、依赖行情接收子级插件：quotex_client_stock_ltp、quotex_client_future_ctp；
# 3、演示 DirectCall 的同步和异步调用；
# 4、演示 SubscribeInfo 和 UnsubscribeInfo 回调信息订阅退订；

# 注意：版本 >= 0.5.14 的，编译环境 Visual Studio 从 17.9.X 升级为 17.10.X 后，
#      对于 Python 3.6、3.7、3.8、3.9、3.10、3.11 存在一些兼容问题，
#      需要将 import cyberx 语句放在 import 如 pandas、PyQt5 等其他第三方库之前，
#      对于 Python 3.12 则仍然可以正常地任意放置，初始化 cyberx.Kernel 时不会异常。

import json
import threading

import cyberx

import syscfg
# import cyberx

#msg_code_string   = 1 # 直接字符串
msg_code_json     = 2 # Json格式
#msg_code_base64   = 3 # Base64格式
#msg_code_protobuf = 4 # ProtoBuf格式
#msg_code_zlib     = 5 # ZLib格式
#msg_code_msgpack  = 6 # MsgPack格式

msg_func_return_info_log = 1 # 回调返回的日志信息
msg_func_return_data_xxx = 2 # 回调返回的某类数据

func_client_start   = 1
func_client_stop    = 2
func_get_quote_data = 3

#func_stock_tdf_market_s = 2101 # TDF 个股快照
#func_stock_tdf_market_i = 2102 # TDF 指数快照
#func_stock_tdf_market_t = 2103 # TDF 逐笔成交
#func_stock_ltb_market_s = 2106 # LTB 个股快照
#func_stock_ltb_market_i = 2107 # LTB 指数快照
#func_stock_ltb_market_t = 2108 # LTB 逐笔成交
func_stock_ltp_market_s = 2111 # LTP 个股快照
func_stock_ltp_market_i = 2112 # LTP 指数快照
func_stock_ltp_market_t = 2113 # LTP 逐笔成交
#func_stock_hgt_market_s = 2116 # HGT 个股快照
#func_stock_sgt_market_s = 2117 # SGT 个股快照
#func_stock_xsb_market_s = 2118 # XSB 个股快照
func_future_ctp_market  = 2201 # CTP 期货快照
#func_option_ctp_market  = 2301 # CTP 期权快照

call_wait_time = 10 # 秒
success_client_start_stop = False

event_call_finish = threading.Event()

class deploy_stock_ltp(object):
    def __init__(self):
        self.flag = "stock_ltp"
        self.addr = "10.0.7.200"
        self.port = 8001
        self.client = "quotex_client_stock_ltp"
        self.subscribe = [{"quote_type":func_stock_ltp_market_s, "quote_list":"510050, 510300, 510500, 512100"}, 
                          {"quote_type":func_stock_ltp_market_i, "quote_list":"000016, 000300, 000905, 000852"}, 
                          {"quote_type":func_stock_ltp_market_t, "quote_list":""}]

class deploy_stock_hgt(object):
    def __init__(self):
        self.flag = "stock_hgt"
        self.addr = "10.0.7.200"
        self.port = 8021
        self.client = "quotex_client_stock_hgt"
        self.subscribe = [{"quote_type":func_stock_hgt_market_s, "quote_list":""}]

class deploy_stock_sgt(object):
    def __init__(self):
        self.flag = "stock_sgt"
        self.addr = "10.0.7.200"
        self.port = 8031
        self.client = "quotex_client_stock_sgt"
        self.subscribe = [{"quote_type":func_stock_sgt_market_s, "quote_list":""}]

class deploy_stock_xsb(object):
    def __init__(self):
        self.flag = "stock_xsb"
        self.addr = "10.0.7.200"
        self.port = 8041
        self.client = "quotex_client_stock_xsb"
        self.subscribe = [{"quote_type":func_stock_xsb_market_s, "quote_list":""}]

class deploy_future_ctp(object):
    def __init__(self):
        self.flag = "future_ctp"
        self.addr = "10.0.7.200"
        self.port = 8011
        self.client = "quotex_client_future_ctp"
        self.subscribe = [{"quote_type":func_future_ctp_market, "quote_list":""}]

class deploy_option_ctp(object):
    def __init__(self):
        self.flag = "option_ctp"
        self.addr = "10.0.7.200"
        self.port = 8051
        self.client = "quotex_client_option_ctp"
        self.subscribe = [{"quote_type":func_option_ctp_market, "quote_list":""}]

class config_quote(object):
    def __init__(self, deploy):
        self.quote_flag = deploy.flag
        self.quote_addr = deploy.addr
        self.quote_port = deploy.port
        self.quote_client = deploy.client
        self.quote_subscribe = deploy.subscribe
    
    def ToJson(self):
        return json.dumps(self.__dict__)
        #return json.dumps(self.__dict__, sort_keys = False, indent = 4, separators = (",", ": "))

def OnClientStart(result):
    global success_client_start_stop
    try:
        if result["return_code"] != 0:
            success_client_start_stop = False
            print(result["return_code"], result["return_info"])
        else:
            success_client_start_stop = True
            result_data = json.loads(result["result_data"])
            print("ClientStart:", result["return_info"], result_data)
    except Exception as e:
        print("OnClientStart 异常！%s" % e)
    event_call_finish.set() #

def OnClientStop(result):
    global success_client_start_stop
    try:
        if result["return_code"] != 0:
            success_client_start_stop = False
            print(result["return_code"], result["return_info"])
        else:
            success_client_start_stop = True
            result_data = json.loads(result["result_data"])
            print("ClientStop:", result["return_info"], result_data)
    except Exception as e:
        print("OnClientStop 异常！%s" % e)
    event_call_finish.set() #

def ClientStart(module, config, callback):
    global success_client_start_stop
    event_call_finish.clear()
    success_client_start_stop = False
    result = json.loads(module.DirectCall(func_client_start, 0, config.ToJson(), callback)) # 异步
    print(result["return_code"], result["return_info"], result["caller_id"])
    if result["return_code"] != 0:
        return False
    else:
        caller_id = result["caller_id"]
        ret_wait = event_call_finish.wait(timeout = call_wait_time) # 等待调用结果
        if ret_wait != True:
            print("等待 行情启用 结果超时！", caller_id)
            return False
        if success_client_start_stop == False:
            print("行情启用 失败！", caller_id)
            return False
        else:
            print("行情启用 成功。", caller_id)
            return True
    return True

def ClientStop(module, config, callback):
    global success_client_start_stop
    event_call_finish.clear()
    success_client_start_stop = False
    result = json.loads(module.DirectCall(func_client_stop, 0, config.ToJson(), callback)) # 异步
    print(result["return_code"], result["return_info"], result["caller_id"])
    if result["return_code"] != 0:
        return False
    else:
        caller_id = result["caller_id"]
        ret_wait = event_call_finish.wait(timeout = call_wait_time) # 等待调用结果
        if ret_wait != True:
            print("等待 行情停用 结果超时！", caller_id)
            return False
        if success_client_start_stop == False:
            print("行情停用 失败！", caller_id)
            return False
        else:
            print("行情停用 成功。", caller_id)
            return True
    return True

def OnReturnInfo_01(result):
    try:
        if result["type"] == msg_func_return_info_log:
            if result["form"] == msg_code_json:
                result = json.loads(result["info"])
                print("01", result["log_level"], result["log_cate"], result["log_info"])
    except Exception as e:
        print("OnReturnInfo_01 异常！%s" % e)

def OnReturnInfo_02(result):
    try:
        if result["type"] == msg_func_return_info_log:
            if result["form"] == msg_code_json:
                result = json.loads(result["info"])
                print("02", result["log_level"], result["log_cate"], result["log_info"])
    except Exception as e:
        print("OnReturnInfo_02 异常！%s" % e)

def GetQuoteData_Stock_LTP_Snaps(module):
    for i in range(call_wait_time):
        config_get_quote_data = {"quote_type":func_stock_ltp_market_s, "quote_exchange":"SSE", "quote_symbol":"510300"}
        result = json.loads(module.DirectCall(func_get_quote_data, 0, json.dumps(config_get_quote_data))) # 同步
        if result["return_code"] != 0:
            print(result["return_code"], result["return_info"])
        else:
            quote_data = result["result_data"]
            print(quote_data["symbol"], quote_data["exchange"], quote_data["last"])
            print(quote_data["ask_price"][0], quote_data["ask_price"][1], quote_data["ask_price"][2], quote_data["ask_price"][3], quote_data["ask_price"][4])
            print(quote_data["ask_price"][5], quote_data["ask_price"][6], quote_data["ask_price"][7], quote_data["ask_price"][8], quote_data["ask_price"][9])
            print(quote_data["bid_price"][0], quote_data["bid_price"][1], quote_data["bid_price"][2], quote_data["bid_price"][3], quote_data["bid_price"][4])
            print(quote_data["bid_price"][5], quote_data["bid_price"][6], quote_data["bid_price"][7], quote_data["bid_price"][8], quote_data["bid_price"][9])
        event_call_finish.clear()
        event_call_finish.wait(timeout = 1) # 秒

def GetQuoteData_Index_LTP_Snaps(module):
    for i in range(call_wait_time):
        config_get_quote_data = {"quote_type":func_stock_ltp_market_i, "quote_exchange":"SSE", "quote_symbol":"000300"}
        result = json.loads(module.DirectCall(func_get_quote_data, 0, json.dumps(config_get_quote_data))) # 同步
        if result["return_code"] != 0:
            print(result["return_code"], result["return_info"])
        else:
            quote_data = result["result_data"]
            print(quote_data["symbol"], quote_data["exchange"], quote_data["last"])
        event_call_finish.clear()
        event_call_finish.wait(timeout = 1) # 秒

def GetQuoteData_Future_CTP_Snaps(module):
    for i in range(call_wait_time):
        config_get_quote_data = {"quote_type":func_future_ctp_market, "quote_exchange":"CFFEX", "quote_symbol":"IF2409"} # 标的代码全为大写
        result = json.loads(module.DirectCall(func_get_quote_data, 0, json.dumps(config_get_quote_data))) # 同步
        if result["return_code"] != 0:
            print(result["return_code"], result["return_info"])
        else:
            quote_data = result["result_data"]
            print(quote_data["symbol"], quote_data["exchange"], quote_data["last"])
            print(quote_data["ask_price"][0], quote_data["ask_price"][1], quote_data["ask_price"][2], quote_data["ask_price"][3], quote_data["ask_price"][4])
            print(quote_data["bid_price"][0], quote_data["bid_price"][1], quote_data["bid_price"][2], quote_data["bid_price"][3], quote_data["bid_price"][4])
        event_call_finish.clear()
        event_call_finish.wait(timeout = 1) # 秒

def Test_QuoteX_Center():
    kernel = cyberx.Kernel(syscfg.SysCfg().ToArgs()) # 全局唯一
    module = cyberx.Create("quotex_center") # 全局唯一
    #module_01 = cyberx.Create("quotex_center") # 重复创建会报异常
    #module_01 = cyberx.GetCreate("quotex_center") # 可以获取已创建的实例
    subscribe_id_01 = module.SubscribeInfo(OnReturnInfo_01) # 订阅信息
    subscribe_id_02 = module.SubscribeInfo(OnReturnInfo_02) # 订阅信息
    
    #deploy = deploy_stock_ltp()
    #deploy = deploy_stock_hgt()
    #deploy = deploy_stock_sgt()
    #deploy = deploy_stock_xsb()
    deploy = deploy_future_ctp()
    #deploy = deploy_option_ctp()
    
    config = config_quote(deploy)
    
    result = ClientStart(module, config, OnClientStart)
    print(result)
    
    #GetQuoteData_Stock_LTP_Snaps(module)
    #GetQuoteData_Index_LTP_Snaps(module)
    GetQuoteData_Future_CTP_Snaps(module)
    
    #event_call_finish.clear()
    #event_call_finish.wait(timeout = call_wait_time) # 秒
    
    result = ClientStop(module, config, OnClientStop)
    print(result)
    
    event_call_finish.clear()
    event_call_finish.wait(timeout = call_wait_time) # 秒
    
    module.UnsubscribeInfo(subscribe_id_01) # 退订信息
    module.UnsubscribeInfo(subscribe_id_02) # 退订信息

if __name__ == "__main__":
    Test_QuoteX_Center()
