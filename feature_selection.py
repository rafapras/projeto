
import pandas as pd
import numpy as np
from feature_engineering import auto_binning

def calculate_iv(df, feature, target):
    """
    Calculates the Information Value (IV) of a feature.
    """
    lst = []
    for i in range(df[feature].nunique()):
        val = list(df[feature].unique())[i]
        lst.append([val, df[df[feature] == val].count()[feature], df[(df[feature] == val) & (df[target] == 1)].count()[feature]])

    data = pd.DataFrame(lst, columns=['Value', 'All', 'Good'])
    data['Bad'] = data['All'] - data['Good']
    data['Share'] = data['All'] / data['All'].sum()
    data['Bad Rate'] = data['Bad'] / data['All']
    data['Distribution Good'] = (data['All'] - data['Bad']) / (data['All'].sum() - data['Bad'].sum())
    data['Distribution Bad'] = data['Bad'] / data['Bad'].sum()
    data['WoE'] = np.log(data['Distribution Good'] / data['Distribution Bad'])
    data = data.replace({'WoE': {np.inf: 0, -np.inf: 0}})
    data['IV'] = data['WoE'] * (data['Distribution Good'] - data['Distribution Bad'])

    return data['IV'].sum()

def calculate_psi(train_df, oot_df, feature):
    """
    Calculates the Population Stability Index (PSI) of a feature.
    """
    train_dist = train_df[feature].value_counts(normalize=True).rename('train_dist')
    oot_dist = oot_df[feature].value_counts(normalize=True).rename('oot_dist')

    psi_df = pd.concat([train_dist, oot_dist], axis=1).fillna(0)
    psi_df['psi'] = (psi_df['oot_dist'] - psi_df['train_dist']) * np.log(psi_df['oot_dist'] / psi_df['train_dist'])

    return psi_df['psi'].sum()

if __name__ == '__main__':
    # Load and bin the data
    df = pd.read_csv('synthetic_dataset.csv')
    df_binned = auto_binning(df)

    # Split the data into "train" and "OOT" sets
    split_date = df_binned['timestamp'].quantile(0.8, interpolation='nearest')
    train_df = df_binned[df_binned['timestamp'] < split_date]
    oot_df = df_binned[df_binned['timestamp'] >= split_date]

    # Calculate IV and PSI for each binned feature
    for col in df_binned.columns:
        if '_binned' in col:
            iv = calculate_iv(train_df, col, 'target')
            psi = calculate_psi(train_df, oot_df, col)
            print(f"Feature: {col}, IV: {iv:.4f}, PSI: {psi:.4f}")
