const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
var connect = new AWS.Connect();

// スキル起動時
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'メニューをタップしてください。';
        return handlerInput.responseBuilder
            .speak(speechText)
            .addDirective({
                type : 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                token: "token",
                document: require('./apl_top.json')
            })            
            .getResponse();
    }
};

// 画面タッチ処理
// シミュレーターではonPressが反応し、実機ではPressが反応するため2つ書いておく
const TouchEventHandler = {
    canHandle(handlerInput) {
    return ((Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent' &&
        (handlerInput.requestEnvelope.request.source.handler === 'Press' || 
        handlerInput.requestEnvelope.request.source.handler === 'onPress')));
    },
    async handle(handlerInput) {
        
        // 電話をかける
        await CallAction();
        
        const speechText = '電話をかけます。'
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

// 電話をかける処理
function CallAction() {
    return new Promise(((resolve, reject) => {
    
        var params = {
            InstanceId: process.env.INSTANCEID,
            ContactFlowId: process.env.CONTACTFLOWID,
            DestinationPhoneNumber: process.env.PHONENUMBER,
            SourcePhoneNumber: process.env.SOURCEPHONENUMBER
        };
    
        connect.startOutboundVoiceContact(params, function(err, data) {
            if (err) {
                console.log(err);
                reject();
            } else {
                resolve(data);
            }
        });
        
    }));
}

// コール処理
const CallIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CallIntent';
    },
    async handle(handlerInput) {
        
        // 電話をかける
        await CallAction();
        
        const speechText = '電話をかけます。';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

// ヘルプ
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = '電話をかける場合は、ボタンを押してください。';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// キャンセルor終了と発話された
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'バイバイ！またね！';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

// セッション切れ
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// エラー時
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `不明なエラーが出ました`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// 各種Handlerを登録する
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CallIntentHandler,
        TouchEventHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
