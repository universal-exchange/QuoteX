/*
* Copyright (c) 2024-2024 the DerivX authors
* All rights reserved.
*
* The project sponsor and lead author is Xu Rendong.
* E-mail: xrd@ustc.edu, QQ: 277195007, WeChat: xrd_ustc
* See the contributors file for names of other contributors.
*
* Commercial use of this code in source and binary forms is
* governed by a LGPL v3 license. You may get a copy from the
* root directory. Or else you should get a specific written
* permission from the project author.
*
* Individual and educational use of this code in source and
* binary forms is governed by a 3-clause BSD license. You may
* get a copy from the root directory. Certainly welcome you
* to contribute code of all sorts.
*
* Be sure to retain the above copyright notice and conditions.
*/

// 示例说明：
// 1、演示 quotex_center 行情中心父级插件的使用；
// 2、依赖行情接收子级插件：quotex_client_stock_ltp、quotex_client_future_ctp；
// 3、演示 DirectCall 的同步和异步调用；
// 4、演示 SubscribeInfo 和 UnsubscribeInfo 回调信息订阅退订；

'use strict'

// 使用 timers/promises 的 setTimeout 要求 Node 版本为 15.0.0 及以上
// 以后可以用 timers/promises 的 scheduler.wait 代替，要求 Node 版本为 17.3.0 及以上
const promises = require('timers/promises')

const syscfg = require('./syscfg')
const cyberx = require('cyberx') // cyberx-js

//let msg_code_string   = 1 // 直接字符串
let msg_code_json     = 2 // Json格式
//let msg_code_base64   = 3 // Base64格式
//let msg_code_protobuf = 4 // ProtoBuf格式
//let msg_code_zlib     = 5 // ZLib格式
//let msg_code_msgpack  = 6 // MsgPack格式

let msg_func_return_info_log = 1 // 回调返回的日志信息
let msg_func_return_data_xxx = 2 // 回调返回的某类数据

let func_client_start   = 1
let func_client_stop    = 2
let func_get_quote_data = 3

//let func_stock_tdf_market_s = 2101 // TDF 个股快照
//let func_stock_tdf_market_i = 2102 // TDF 指数快照
//let func_stock_tdf_market_t = 2103 // TDF 逐笔成交
//let func_stock_ltb_market_s = 2106 // LTB 个股快照
//let func_stock_ltb_market_i = 2107 // LTB 指数快照
//let func_stock_ltb_market_t = 2108 // LTB 逐笔成交
let func_stock_ltp_market_s = 2111 // LTP 个股快照
let func_stock_ltp_market_i = 2112 // LTP 指数快照
let func_stock_ltp_market_t = 2113 // LTP 逐笔成交
//let func_stock_hgt_market_s = 2116 // HGT 个股快照
//let func_stock_sgt_market_s = 2117 // SGT 个股快照
//let func_stock_xsb_market_s = 2118 // XSB 个股快照
let func_future_ctp_market  = 2201 // CTP 期货快照
//let func_option_ctp_market  = 2301 // CTP 期权快照

let call_wait_time = 10 // 秒
let success_client_start_stop = false

let event_call_finish = null // AbortController

class deploy_stock_ltp {
    constructor() {
        this.flag = 'stock_ltp'
        this.addr = '10.0.7.200'
        this.port = 8001
        this.client = 'quotex_client_stock_ltp'
        this.subscribe = [{'quote_type':func_stock_ltp_market_s, 'quote_list':'510050, 510300, 510500, 512100'}, 
                          {'quote_type':func_stock_ltp_market_i, 'quote_list':'000016, 000300, 000905, 000852'}, 
                          {'quote_type':func_stock_ltp_market_t, 'quote_list':''}]
    }
}

class deploy_stock_hgt {
    constructor() {
        this.flag = 'stock_hgt'
        this.addr = '10.0.7.200'
        this.port = 8021
        this.client = 'quotex_client_stock_hgt'
        this.subscribe = [{'quote_type':func_stock_hgt_market_s, 'quote_list':''}]
    }
}

class deploy_stock_sgt {
    constructor() {
        this.flag = 'stock_sgt'
        this.addr = '10.0.7.200'
        this.port = 8031
        this.client = 'quotex_client_stock_sgt'
        this.subscribe = [{'quote_type':func_stock_sgt_market_s, 'quote_list':''}]
    }
}

class deploy_stock_xsb {
    constructor() {
        this.flag = 'stock_xsb'
        this.addr = '10.0.7.200'
        this.port = 8041
        this.client = 'quotex_client_stock_xsb'
        this.subscribe = [{'quote_type':func_stock_xsb_market_s, 'quote_list':''}]
    }
}

class deploy_future_ctp {
    constructor() {
        this.flag = 'future_ctp'
        this.addr = '10.0.7.200'
        this.port = 8011
        this.client = 'quotex_client_future_ctp'
        this.subscribe = [{'quote_type':func_future_ctp_market, 'quote_list':''}]
    }
}

class deploy_option_ctp {
    constructor() {
        this.flag = 'option_ctp'
        this.addr = '10.0.7.200'
        this.port = 8051
        this.client = 'quotex_client_option_ctp'
        this.subscribe = [{'quote_type':func_option_ctp_market, 'quote_list':''}]
    }
}

class config_quote {
    constructor(deploy) {
        this.quote_flag = deploy.flag
        this.quote_addr = deploy.addr
        this.quote_port = deploy.port
        this.quote_client = deploy.client
        this.quote_subscribe = deploy.subscribe
    }
    
    ToJson() {
        return JSON.stringify(this)
        //return JSON.stringify(this, null, 4)
    }
}

function OnClientStart() {
    try {
        let [result] = Array.from(arguments)
        if(result['return_code'] !== 0) {
            success_client_start_stop = false
            console.log(result['return_code'], result['return_info'])
        }
        else {
            success_client_start_stop = true
            let result_data = JSON.parse(result['result_data'])
            console.log('ClientStart:', result['return_info'], result_data)
        }
    }
    catch(error) {
        console.log('OnClientStart 异常！' + error)
    }
    event_call_finish.abort() //
}

function OnClientStop() {
    try {
        let [result] = Array.from(arguments)
        if(result['return_code'] !== 0) {
            success_client_start_stop = false
            console.log(result['return_code'], result['return_info'])
        }
        else {
            success_client_start_stop = true
            let result_data = JSON.parse(result['result_data'])
            console.log('ClientStop:', result['return_info'], result_data)
        }
    }
    catch(error) {
        console.log('OnClientStop 异常！' + error)
    }
    event_call_finish.abort() //
}

async function ClientStart(module, config, callback) {
    success_client_start_stop = false
    event_call_finish = new AbortController()
    let result = JSON.parse(module.DirectCall(func_client_start, 0, config.ToJson(), callback)) // 异步
    console.log(result['return_code'], result['return_info'], result['caller_id'])
    if(result['return_code'] !== 0) {
        return false
    }
    else {
        let caller_id = result['caller_id']
        const ret_wait = await promises.setTimeout(call_wait_time * 1000, '', { signal:event_call_finish.signal }).then(() => false, err => true) // 等待调用结果
        if(ret_wait != true) {
            console.log('等待 行情启用 结果超时！' + caller_id)
            return false
        }
        if(success_client_start_stop === false) {
            console.log('行情启用 失败！' + caller_id)
            return false
        }
        else {
            console.log('行情启用 成功。' + caller_id)
            return true
        }
    }
    return true
}

async function ClientStop(module, config, callback) {
    success_client_start_stop = false
    event_call_finish = new AbortController()
    let result = JSON.parse(module.DirectCall(func_client_stop, 0, config.ToJson(), callback)) // 异步
    console.log(result['return_code'], result['return_info'], result['caller_id'])
    if(result['return_code'] !== 0) {
        return false
    }
    else {
        let caller_id = result['caller_id']
        const ret_wait = await promises.setTimeout(call_wait_time * 1000, '', { signal:event_call_finish.signal }).then(() => false, err => true) // 等待调用结果
        if(ret_wait != true) {
            console.log('等待 行情停用 结果超时！' + caller_id)
            return false
        }
        if(success_client_start_stop === false) {
            console.log('行情停用 失败！' + caller_id)
            return false
        }
        else {
            console.log('行情停用 成功。' + caller_id)
            return true
        }
    }
    return true
}

function OnReturnInfo_01() {
    try {
        let [result] = Array.from(arguments)
        if(result['type'] === msg_func_return_info_log) {
            if(result['form'] === msg_code_json) {
                result = JSON.parse(result['info'])
                console.log('01', result['log_level'], result['log_cate'], result['log_info'])
            }
        }
    }
    catch(error) {
        console.log('OnReturnInfo_01 异常！' + error)
    }
}

function OnReturnInfo_02() {
    try {
        let [result] = Array.from(arguments)
        if(result['type'] === msg_func_return_info_log) {
            if(result['form'] === msg_code_json) {
                result = JSON.parse(result['info'])
                console.log('02', result['log_level'], result['log_cate'], result['log_info'])
            }
        }
    }
    catch(error) {
        console.log('OnReturnInfo_02 异常！' + error)
    }
}

async function GetQuoteData_Stock_LTP_Snaps(module) {
    for(let i = 0; i < call_wait_time; i++) {
        let config_get_quote_data = {'quote_type':func_stock_ltp_market_s, 'quote_exchange':'SSE', 'quote_symbol':'510300'}
        let result = JSON.parse(module.DirectCall(func_get_quote_data, 0, JSON.stringify(config_get_quote_data))) // 同步
        if(result['return_code'] !== 0) {
            console.log(result['return_code'], result['return_info'])
        }
        else {
            let quote_data = result['result_data']
            console.log(quote_data['symbol'], quote_data['exchange'], quote_data['last'])
            console.log(quote_data['ask_price'][0], quote_data['ask_price'][1], quote_data['ask_price'][2], quote_data['ask_price'][3], quote_data['ask_price'][4])
            console.log(quote_data['ask_price'][5], quote_data['ask_price'][6], quote_data['ask_price'][7], quote_data['ask_price'][8], quote_data['ask_price'][9])
            console.log(quote_data['bid_price'][0], quote_data['bid_price'][1], quote_data['bid_price'][2], quote_data['bid_price'][3], quote_data['bid_price'][4])
            console.log(quote_data['bid_price'][5], quote_data['bid_price'][6], quote_data['bid_price'][7], quote_data['bid_price'][8], quote_data['bid_price'][9])
        }
        await promises.setTimeout(1000, '', {})
    }
}

async function GetQuoteData_Index_LTP_Snaps(module) {
    for(let i = 0; i < call_wait_time; i++) {
        let config_get_quote_data = {'quote_type':func_stock_ltp_market_i, 'quote_exchange':'SSE', 'quote_symbol':'000300'}
        let result = JSON.parse(module.DirectCall(func_get_quote_data, 0, JSON.stringify(config_get_quote_data))) // 同步
        if(result['return_code'] !== 0) {
            console.log(result['return_code'], result['return_info'])
        }
        else {
            let quote_data = result['result_data']
            console.log(quote_data['symbol'], quote_data['exchange'], quote_data['last'])
        }
        await promises.setTimeout(1000, '', {})
    }
}

async function GetQuoteData_Future_CTP_Snaps(module) {
    for(let i = 0; i < call_wait_time; i++) {
        let config_get_quote_data = {'quote_type':func_future_ctp_market, 'quote_exchange':'CFFEX', 'quote_symbol':'IF2409'} // 标的代码全为大写
        let result = JSON.parse(module.DirectCall(func_get_quote_data, 0, JSON.stringify(config_get_quote_data))) // 同步
        if(result['return_code'] !== 0) {
            console.log(result['return_code'], result['return_info'])
        }
        else {
            let quote_data = result['result_data']
            console.log(quote_data['symbol'], quote_data['exchange'], quote_data['last'])
            console.log(quote_data['ask_price'][0], quote_data['ask_price'][1], quote_data['ask_price'][2], quote_data['ask_price'][3], quote_data['ask_price'][4])
            console.log(quote_data['bid_price'][0], quote_data['bid_price'][1], quote_data['bid_price'][2], quote_data['bid_price'][3], quote_data['bid_price'][4])
        }
        await promises.setTimeout(1000, '', {})
    }
}

async function Test_QuoteX_Center() {
    let kernel = new cyberx.Kernel(new syscfg.SysCfg()) // 全局唯一
    let module = new cyberx.Create('quotex_center') // 全局唯一
    //let module_01 = new cyberx.Create('quotex_center') // 重复创建会报异常
    //let module_01 = new cyberx.GetCreate('quotex_center') // 可以获取已创建的实例
    let subscribe_id_01 = module.SubscribeInfo(OnReturnInfo_01) // 订阅信息
    let subscribe_id_02 = module.SubscribeInfo(OnReturnInfo_02) // 订阅信息
    
    //let deploy = new deploy_stock_ltp()
    //let deploy = new deploy_stock_hgt()
    //let deploy = new deploy_stock_sgt()
    //let deploy = new deploy_stock_xsb()
    let deploy = new deploy_future_ctp()
    //let deploy = new deploy_option_ctp()
    
    let config = new config_quote(deploy)
    
    let result = null
    
    result = await ClientStart(module, config, OnClientStart)
    console.log(result)
    
    //await GetQuoteData_Stock_LTP_Snaps(module)
    //await GetQuoteData_Index_LTP_Snaps(module)
    await GetQuoteData_Future_CTP_Snaps(module)
    
    //await promises.setTimeout(call_wait_time * 1000, '', {})
    
    result = await ClientStop(module, config, OnClientStop)
    console.log(result)
    
    await promises.setTimeout(call_wait_time * 1000, '', {})
    
    module.UnsubscribeInfo(subscribe_id_01) // 退订信息
    module.UnsubscribeInfo(subscribe_id_02) // 退订信息
}

Test_QuoteX_Center()
