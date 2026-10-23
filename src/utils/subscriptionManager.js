import { ref } from 'vue';
import { t } from '../i18n';

const STORAGE_KEY = 'calendar_subscriptions';

// 所有可用的订阅项（name/desc 为随语言切换的 getter，id 为存储标识不变）
export const AVAILABLE_SUBSCRIPTIONS = [
    {
        id: 'weather',
        get name() {
            return t('subscriptionData.weather.name');
        },
        get desc() {
            return t('subscriptionData.weather.desc');
        },
        icon: 'cloud-outlined',
        color: '#1890ff',
        bg: '#e6f7ff'
    },
    {
        id: 'lunar',
        get name() {
            return t('subscriptionData.lunar.name');
        },
        get desc() {
            return t('subscriptionData.lunar.desc');
        },
        icon: 'info-circle-outlined',
        color: '#87d068',
        bg: '#f6ffed'
    },
    {
        id: 'huangli',
        get name() {
            return t('subscriptionData.huangli.name');
        },
        get desc() {
            return t('subscriptionData.huangli.desc');
        },
        icon: 'experiment-outlined',
        color: '#fa8c16',
        bg: '#fff7e6'
    },
    {
        id: 'zodiac',
        get name() {
            return t('subscriptionData.zodiac.name');
        },
        get desc() {
            return t('subscriptionData.zodiac.desc');
        },
        icon: 'rocket-outlined',
        color: '#722ed1',
        bg: '#f9f0ff'
    },
    {
        id: 'worldClock',
        get name() {
            return t('subscriptionData.worldClock.name');
        },
        get desc() {
            return t('subscriptionData.worldClock.desc');
        },
        icon: 'global-outlined',
        color: '#13c2c2',
        bg: '#e6fffb'
    },
    {
        id: 'schedule',
        get name() {
            return t('subscriptionData.schedule.name');
        },
        get desc() {
            return t('subscriptionData.schedule.desc');
        },
        icon: 'calendar-outlined',
        color: '#1890ff',
        bg: '#e6f7ff'
    }
];

class SubscriptionManager {
    constructor() {
        this.subscribedIds = ref(this._loadFromStorage());
    }

    _loadFromStorage() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('加载订阅数据失败:', e);
            }
        }
        // 默认订阅
        return ['weather', 'worldClock', 'lunar', 'huangli'];
    }

    _saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.subscribedIds.value));
    }

    isSubscribed(id) {
        return this.subscribedIds.value.includes(id);
    }

    toggleSubscription(id) {
        const index = this.subscribedIds.value.indexOf(id);
        if (index > -1) {
            this.subscribedIds.value.splice(index, 1);
        } else {
            this.subscribedIds.value.push(id);
        }
        // 确保触发响应式更新
        this.subscribedIds.value = [...this.subscribedIds.value];
        this._saveToStorage();
    }

    getSubscribedItems() {
        return AVAILABLE_SUBSCRIPTIONS.filter((item) => this.subscribedIds.value.includes(item.id));
    }

    getAllItems() {
        return AVAILABLE_SUBSCRIPTIONS.map((item) => ({
            ...item,
            isSubscribed: this.isSubscribed(item.id)
        }));
    }
}

export default new SubscriptionManager();
