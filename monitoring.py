
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from feature_engineering import auto_binning
import altair as alt

if __name__ == '__main__':
    # Load and bin the data
    df = pd.read_csv('synthetic_dataset.csv', parse_dates=['timestamp'])
    df_binned = auto_binning(df)

    # One-hot encode the selected binned features
    selected_features = ['feature2_binned', 'category1_binned']
    df_model = pd.get_dummies(df_binned, columns=selected_features, drop_first=True)

    # Set the timestamp as the index
    df_model.set_index('timestamp', inplace=True)

    # Get the unique months in the dataset
    months = df_model.index.to_period('M').unique()

    # Initialize a list to store the monitoring results
    monitoring_results = []

    # Loop through each month, starting from the second month
    for i in range(1, len(months)):
        # Define the training and prediction periods
        train_period = months[:i]
        predict_period = months[i]

        # Split the data into training and prediction sets
        train_df = df_model[df_model.index.to_period('M').isin(train_period)]
        predict_df = df_model[df_model.index.to_period('M') == predict_period]

        # Define the features and target for the model
        features = [col for col in df_model.columns if any(feat in col for feat in selected_features)]
        target = 'target'

        X_train, y_train = train_df[features], train_df[target]
        X_predict, y_predict = predict_df[features], predict_df[target]

        # Train the logistic regression model
        model = LogisticRegression()
        model.fit(X_train, y_train)

        # Make predictions on the prediction set
        y_pred = model.predict_proba(X_predict)[:, 1]

        # Calculate the AUC and average predicted probability
        auc = roc_auc_score(y_predict, y_pred)
        avg_proba = y_pred.mean()

        # Append the results to the list
        monitoring_results.append({'month': predict_period.to_timestamp(), 'auc': auc, 'avg_proba': avg_proba})

    # Create a DataFrame from the monitoring results
    monitoring_df = pd.DataFrame(monitoring_results)

    # Create the AUC monitoring chart
    auc_chart = alt.Chart(monitoring_df).mark_line().encode(
        x='month:T',
        y='auc:Q',
        tooltip=['month', 'auc']
    ).properties(
        title='Monthly AUC'
    )

    # Create the average probability monitoring chart
    avg_proba_chart = alt.Chart(monitoring_df).mark_line().encode(
        x='month:T',
        y='avg_proba:Q',
        tooltip=['month', 'avg_proba']
    ).properties(
        title='Monthly Average Predicted Probability'
    )

    # Save the charts to HTML files
    auc_chart.save('plots/monthly_auc.html')
    avg_proba_chart.save('plots/monthly_avg_proba.html')

    print("Monitoring charts saved to the 'plots' directory.")
