
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, roc_curve
from feature_engineering import auto_binning

def ks_statistic(y_true, y_pred):
    """
    Calculates the Kolmogorov-Smirnov (KS) statistic.
    """
    df = pd.DataFrame({'y_true': y_true, 'y_pred': y_pred})
    df.sort_values('y_pred', ascending=False, inplace=True)

    df['cumulative_true'] = df['y_true'].cumsum() / df['y_true'].sum()
    df['cumulative_false'] = (1 - df['y_true']).cumsum() / (1 - df['y_true']).sum()

    ks = abs(df['cumulative_true'] - df['cumulative_false']).max()

    return ks

if __name__ == '__main__':
    # Load and bin the data
    df = pd.read_csv('synthetic_dataset.csv')
    df_binned = auto_binning(df)

    # One-hot encode the selected binned features
    selected_features = ['feature2_binned', 'category1_binned']
    df_model = pd.get_dummies(df_binned, columns=selected_features, drop_first=True)

    # Split the data into "train" and "OOT" sets
    split_date = df_model['timestamp'].quantile(0.8, interpolation='nearest')
    train_df = df_model[df_model['timestamp'] < split_date]
    oot_df = df_model[df_model['timestamp'] >= split_date]

    # Define the features and target for the model
    features = [col for col in df_model.columns if any(feat in col for feat in selected_features)]
    target = 'target'

    X_train, y_train = train_df[features], train_df[target]
    X_oot, y_oot = oot_df[features], oot_df[target]

    # Train the logistic regression model
    model = LogisticRegression()
    model.fit(X_train, y_train)

    # Make predictions on the train and OOT sets
    y_train_pred = model.predict_proba(X_train)[:, 1]
    y_oot_pred = model.predict_proba(X_oot)[:, 1]

    # Evaluate the model
    train_auc = roc_auc_score(y_train, y_train_pred)
    oot_auc = roc_auc_score(y_oot, y_oot_pred)

    train_ks = ks_statistic(y_train, y_train_pred)
    oot_ks = ks_statistic(y_oot, y_oot_pred)

    print(f"Train AUC: {train_auc:.4f}, Train KS: {train_ks:.4f}")
    print(f"OOT AUC: {oot_auc:.4f}, OOT KS: {oot_ks:.4f}")
