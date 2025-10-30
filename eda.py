
import pandas as pd
import altair as alt
from feature_engineering import auto_binning

def plot_share_of_category(df, column):
    """
    Creates a bar chart showing the percentage of observations in each category of a given feature.
    """
    chart_data = (df[column].value_counts(normalize=True)
                  .reset_index())
    chart_data.columns = ['category', 'percentage']

    # Explicitly convert the category column to string to avoid altair type inference issues
    chart_data['category'] = chart_data['category'].astype(str)

    chart = alt.Chart(chart_data).mark_bar().encode(
        x=alt.X('category:N', title='Category', sort=None),
        y=alt.Y('percentage:Q', title='Percentage'),
        tooltip=['category', alt.Tooltip('percentage:Q', format='.2%')]
    ).properties(
        title=f'Share of Category for {column}'
    )

    return chart

def plot_bad_rate_by_category(df, column):
    """
    Creates a bar chart showing the "bad rate" (the percentage of positive target values) for each category of a given feature.
    """
    chart_data = (df.groupby(column)['target']
                  .mean()
                  .reset_index())
    chart_data.columns = ['category', 'bad_rate']

    # Explicitly convert the category column to string to avoid altair type inference issues
    chart_data['category'] = chart_data['category'].astype(str)

    chart = alt.Chart(chart_data).mark_bar().encode(
        x=alt.X('category:N', title='Category', sort=None),
        y=alt.Y('bad_rate:Q', title='Bad Rate'),
        tooltip=['category', alt.Tooltip('bad_rate:Q', format='.2%')]
    ).properties(
        title=f'Bad Rate by Category for {column}'
    )

    return chart

def create_comparison_table(train_df, oot_df, column):
    """
    Creates a comparison table for a given feature, showing the distribution of values in the "train" and OOT sets.
    """
    train_dist = train_df[column].value_counts(normalize=True).rename('train_dist')
    oot_dist = oot_df[column].value_counts(normalize=True).rename('oot_dist')

    comparison_table = pd.concat([train_dist, oot_dist], axis=1).fillna(0)

    return comparison_table

if __name__ == '__main__':
    # Load and bin the data
    df = pd.read_csv('synthetic_dataset.csv')
    df_binned = auto_binning(df)

    # Split the data into "train" and "OOT" sets
    split_date = df_binned['timestamp'].quantile(0.8, interpolation='nearest')
    train_df = df_binned[df_binned['timestamp'] < split_date]
    oot_df = df_binned[df_binned['timestamp'] >= split_date]

    # Create a directory to save the plots
    import os
    if not os.path.exists('plots'):
        os.makedirs('plots')

    # Generate and save plots for each binned feature
    for col in df_binned.columns:
        if '_binned' in col:
            # Create and save the share-of-category plot
            share_chart = plot_share_of_category(df_binned, col)
            share_chart.save(f'plots/{col}_share.html')

            # Create and save the bad-rate plot
            bad_rate_chart = plot_bad_rate_by_category(df_binned, col)
            bad_rate_chart.save(f'plots/{col}_bad_rate.html')

            # Create and print the comparison table
            comparison_table = create_comparison_table(train_df, oot_df, col)
            print(f"Comparison Table for {col}:\n{comparison_table}\n")
